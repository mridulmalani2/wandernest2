/**
 * Automatic Matching Service
 *
 * Triggers when a tourist creates a booking request
 * - Finds candidate students using scoring algorithm
 * - Creates RequestSelection records with 'pending' status
 * - Sends secure email invitations to each candidate
 *
 * SECURITY: Secure logging (no raw error objects), duplicate prevention,
 * accurate success/failure reporting
 */

import { requireDatabase } from '@/lib/prisma';
import { TouristRequest, Student } from '@prisma/client';
import { findMatches } from './algorithm';
import { sendStudentMatchInvitation } from '@/lib/email';
import { generateMatchUrls } from '@/lib/auth/tokens';
import { Prisma } from '@prisma/client';

export interface AutoMatchResult {
  success: boolean;
  candidatesFound: number;
  invitationsSent: number;
  emailFailures: number;
  errors: string[];
}

/**
 * Safely extract error message without exposing stack traces or internal details
 */
function sanitizeError(err: unknown): string {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle known Prisma errors with safe messages
    if (err.code === 'P2002') {
      return 'Duplicate record exists';
    }
    return `Database error: ${err.code}`;
  }
  if (err instanceof Error) {
    // Only return message, not stack trace
    return err.message;
  }
  return 'Unknown error';
}

/**
 * Automatically find and invite candidate students for a tourist request
 *
 * @param request - The TouristRequest to match
 * @param maxCandidates - Maximum number of candidates to invite (default 4)
 * @returns Result summary with accurate success/failure status
 *
 * SECURITY FIXES:
 * - Checks for existing RequestSelection to prevent duplicates
 * - Reports email failures accurately (does not hide them)
 * - Sanitizes error logging (no raw error objects)
 */
export async function autoMatchAndInvite(
  request: TouristRequest,
  maxCandidates: number = 4
): Promise<AutoMatchResult> {
  const db = requireDatabase();
  const errors: string[] = [];

  try {
    console.log(`[autoMatchAndInvite] Starting auto-match for request ${request.id} in ${request.city}`);

    // Step 1: Find candidate students using existing matching algorithm
    const candidates = await findMatches(request);

    // IMPORTANT: Zero matches is a VALID SUCCESS state, not an error
    // The booking request has been successfully created and saved
    // The tourist will be notified when matching guides become available
    if (candidates.length === 0) {
      console.log(`[autoMatchAndInvite] No candidates found for request ${request.id} - this is a valid success state`);
      return {
        success: true, // Zero matches is NOT an error - booking is successfully created
        candidatesFound: 0,
        invitationsSent: 0,
        emailFailures: 0,
        errors: ['No matching students found in this city yet - tourist will be notified when guides become available'],
      };
    }

    console.log(`[autoMatchAndInvite] Found ${candidates.length} candidates for request ${request.id}`);

    // Limit to maxCandidates
    const selectedCandidates = candidates.slice(0, maxCandidates);

    // SECURITY: Check for existing selections to prevent duplicates on retry/concurrent runs
    const existingSelections = await db.requestSelection.findMany({
      where: { requestId: request.id },
      select: { studentId: true },
    });
    const existingStudentIds = new Set(existingSelections.map((s: { studentId: string }) => s.studentId));

    // Filter out candidates who already have a selection for this request
    const newCandidates = selectedCandidates.filter(c => !existingStudentIds.has(c.id));

    if (newCandidates.length === 0 && existingSelections.length > 0) {
      console.log(`[autoMatchAndInvite] All candidates already have selections - skipping creation`);
      return {
        success: true,
        candidatesFound: candidates.length,
        invitationsSent: 0,
        emailFailures: 0,
        errors: ['Selections already exist for all matched candidates'],
      };
    }

    // Step 2 & 3: Create RequestSelection records and Update Status in Transaction
    // SECURITY: Use transaction to ensure we don't end up with MATCHED request but no selections
    const { selections, successCount, createErrors } = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const selectionResults: Array<{ candidateId: string; selectionId: string }> = []
      let createdCount = 0
      const txErrors: string[] = []

      for (const candidate of newCandidates) {
        try {
          const selection = await tx.requestSelection.create({
            data: {
              requestId: request.id,
              studentId: candidate.id,
              status: 'pending',
            },
          });
          selectionResults.push({ candidateId: candidate.id, selectionId: selection.id })
          createdCount++
        } catch (error) {
          // SECURITY: Sanitized logging - no raw error objects
          const safeError = sanitizeError(error);
          console.warn(`[autoMatchAndInvite] Failed to create selection: ${safeError}`);
          txErrors.push(`Selection creation failed: ${safeError}`);
        }
      }

      // Only update status if we successfully created at least one selection
      if (createdCount > 0) {
        await tx.touristRequest.update({
          where: { id: request.id },
          data: { status: 'MATCHED' },
        });
      }

      return { selections: selectionResults, successCount: createdCount, createErrors: txErrors }
    })

    // Add any transaction errors to the errors array
    errors.push(...createErrors);

    console.log(`[autoMatchAndInvite] Successfully matched ${successCount} candidates and updated status`);

    // Step 4: Send invitation emails (outside transaction to avoid blocking DB)
    // SECURITY: Select only required fields, not full Student record
    const emailPromises = selections.map(async ({ candidateId, selectionId }: { candidateId: string; selectionId: string }) => {
      try {
        const student = await db.student.findUnique({
          where: { id: candidateId },
          select: {
            id: true,
            email: true,
            name: true,
            // Only fields needed for email template
          },
        });
        if (!student) {
          errors.push(`Student not found for selection ${selectionId}`);
          return { success: false, candidateId };
        }

        const emailResult = await sendStudentMatchInvitation(student as Student, request, selectionId);

        if (emailResult.success) {
          console.log(`[autoMatchAndInvite] Sent invitation (selection ${selectionId})`);
          return { success: true, candidateId };
        } else {
          // SECURITY: Report email failure accurately
          const errorMsg = `Email failed for selection ${selectionId}: ${emailResult.error || 'Unknown'}`;
          console.warn(`[autoMatchAndInvite] ${errorMsg}`);
          errors.push(errorMsg);
          return { success: false, error: emailResult.error, candidateId };
        }
      } catch (error) {
        // SECURITY: Sanitized error logging
        const safeError = sanitizeError(error);
        console.warn(`[autoMatchAndInvite] Email error: ${safeError}`);
        errors.push(`Email error: ${safeError}`);
        return { success: false, candidateId };
      }
    });

    const emailResults = await Promise.all(emailPromises);
    const invitationsSent = emailResults.filter((r: { success: boolean }) => r.success).length;
    const emailFailures = emailResults.filter((r: { success: boolean }) => !r.success).length;

    console.log(`[autoMatchAndInvite] Completed: ${invitationsSent}/${selections.length} invitations sent`);

    // SECURITY: Accurately report success based on both selection creation AND email delivery
    // If we created selections but all emails failed, that's a partial failure
    const overallSuccess = successCount > 0 && (invitationsSent > 0 || selections.length === 0);

    return {
      success: overallSuccess,
      candidatesFound: candidates.length,
      invitationsSent,
      emailFailures,
      errors,
    };
  } catch (error) {
    // SECURITY: Sanitized error logging
    const safeError = sanitizeError(error);
    console.error(`[autoMatchAndInvite] Fatal error: ${safeError}`);
    return {
      success: false,
      candidatesFound: 0,
      invitationsSent: 0,
      emailFailures: 0,
      errors: [`Fatal error: ${safeError}`],
    };
  }
}
