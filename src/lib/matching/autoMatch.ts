/**
 * Automatic Matching Service
 *
 * Triggers when a tourist creates a booking request
 * - Finds candidate students using scoring algorithm
 * - Creates RequestSelection records with 'pending' status
 * - Sends secure email invitations to each candidate
 */

import { requireDatabase } from '@/lib/prisma';
import { TouristRequest, Student } from '@prisma/client';
import { findMatches } from './algorithm';
import { sendStudentMatchInvitation } from '@/lib/email';
import { generateMatchUrls } from '@/lib/auth/tokens';

export interface AutoMatchResult {
  success: boolean;
  candidatesFound: number;
  invitationsSent: number;
  errors: string[];
}

/**
 * Automatically find and invite candidate students for a tourist request
 *
 * @param request - The TouristRequest to match
 * @param maxCandidates - Maximum number of candidates to invite (default 4)
 * @returns Result summary with success status
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
        errors: ['No matching students found in this city yet - tourist will be notified when guides become available'],
      };
    }

    console.log(`[autoMatchAndInvite] Found ${candidates.length} candidates for request ${request.id}`);

    // Limit to maxCandidates
    const selectedCandidates = candidates.slice(0, maxCandidates);

    // Step 2 & 3: Create RequestSelection records and Update Status in Transaction
    // SECURITY: Use transaction to ensure we don't end up with MATCHED request but no selections
    const { selections, successCount } = await db.$transaction(async (tx) => {
      const selectionResults = []
      let createdCount = 0

      for (const candidate of selectedCandidates) {
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
          // console.log(`[autoMatchAndInvite] Created RequestSelection ${selection.id}`) // Redacted student ID from logs
        } catch (error) {
          // Log error but continue to try other candidates
          console.error(`[autoMatchAndInvite] Failed to create selection for a candidate:`, error);
        }
      }

      // Only update status if we successfully created at least one selection
      if (createdCount > 0) {
        await tx.touristRequest.update({
          where: { id: request.id },
          data: { status: 'MATCHED' },
        });
      }

      return { selections: selectionResults, successCount: createdCount }
    })

    console.log(`[autoMatchAndInvite] Successfully matched ${successCount} candidates and updated status`);

    // Step 4: Send invitation emails (outside transaction to avoid blocking DB)
    const emailPromises = selections.map(async ({ candidateId, selectionId }) => {
      try {
        const student = await db.student.findUnique({ where: { id: candidateId } });
        if (!student) return { success: false, candidateId };

        const emailResult = await sendStudentMatchInvitation(student, request, selectionId);

        if (emailResult.success) {
          console.log(`[autoMatchAndInvite] Sent invitation (selection ${selectionId})`);
          // PII Redacted: Do not log email addresses
          return { success: true, candidateId };
        } else {
          console.error(`[autoMatchAndInvite] Failed to send email (selection ${selectionId})`);
          return { success: false, error: emailResult.error, candidateId };
        }
      } catch (error) {
        console.error(`[autoMatchAndInvite] Email error for candidate ${candidateId}`);
        return { success: false, candidateId };
      }
    });

    const emailResults = await Promise.all(emailPromises);
    const invitationsSent = emailResults.filter(r => r.success).length;

    console.log(`[autoMatchAndInvite] Completed: ${invitationsSent}/${selectedCandidates.length} invitations sent`);

    return {
      success: true,
      candidatesFound: candidates.length,
      invitationsSent,
      errors,
    };
  } catch (error) {
    console.error('[autoMatchAndInvite] Fatal error:', error);
    return {
      success: false,
      candidatesFound: 0,
      invitationsSent: 0,
      errors: [`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}
