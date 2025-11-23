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

    if (candidates.length === 0) {
      console.log(`[autoMatchAndInvite] No candidates found for request ${request.id}`);
      return {
        success: true, // Not an error - just no matches
        candidatesFound: 0,
        invitationsSent: 0,
        errors: ['No matching students found in this city'],
      };
    }

    console.log(`[autoMatchAndInvite] Found ${candidates.length} candidates for request ${request.id}`);

    // Limit to maxCandidates
    const selectedCandidates = candidates.slice(0, maxCandidates);

    // Step 2: Create RequestSelection records for each candidate
    const selectionIds: Record<string, string> = {};

    for (const candidate of selectedCandidates) {
      try {
        const selection = await db.requestSelection.create({
          data: {
            requestId: request.id,
            studentId: candidate.id,
            status: 'pending',
          },
        });

        selectionIds[candidate.id] = selection.id;
        console.log(`[autoMatchAndInvite] Created RequestSelection ${selection.id} for student ${candidate.id}`);
      } catch (error) {
        console.error(`[autoMatchAndInvite] Failed to create RequestSelection for student ${candidate.id}:`, error);
        errors.push(`Failed to create match record for student ${candidate.id}`);
      }
    }

    // Step 3: Update TouristRequest status to MATCHED
    await db.touristRequest.update({
      where: { id: request.id },
      data: { status: 'MATCHED' },
    });

    console.log(`[autoMatchAndInvite] Updated request ${request.id} status to MATCHED`);

    // Step 4: Send invitation emails to each candidate
    let invitationsSent = 0;

    for (const candidate of selectedCandidates) {
      const selectionId = selectionIds[candidate.id];

      if (!selectionId) {
        console.error(`[autoMatchAndInvite] No selectionId found for student ${candidate.id}, skipping email`);
        continue;
      }

      try {
        // Fetch full student record (candidates only have partial data)
        const student = await db.student.findUnique({
          where: { id: candidate.id },
        });

        if (!student) {
          console.error(`[autoMatchAndInvite] Student ${candidate.id} not found, skipping email`);
          errors.push(`Student ${candidate.id} not found`);
          continue;
        }

        // Send invitation email with secure accept/decline links
        const emailResult = await sendStudentMatchInvitation(student, request, selectionId);

        if (emailResult.success) {
          invitationsSent++;
          console.log(`[autoMatchAndInvite] Sent invitation to ${student.email} (selection ${selectionId})`);
        } else {
          console.error(`[autoMatchAndInvite] Failed to send email to ${student.email}:`, emailResult.error);
          errors.push(`Failed to send email to ${student.email}: ${emailResult.error}`);
        }
      } catch (error) {
        console.error(`[autoMatchAndInvite] Error sending invitation to student ${candidate.id}:`, error);
        errors.push(`Error sending invitation to student ${candidate.id}`);
      }
    }

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
