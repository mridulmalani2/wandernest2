import { StartupEmailLayout } from './shared';

/**
 * Email template for admin approval reminder
 * Sent when a student clicks "Re-raise Request" for pending approval
 */
export function getAdminApprovalReminderHtml(
    studentName: string,
    studentEmail: string,
    studentId: string,
    city: string,
    institute: string,
    appliedDate: string
): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tourwiseco.com';
    const approvalUrl = `${baseUrl}/admin/approvals`;

    const content = `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
        🔔 Approval Reminder
      </h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">
        A student has requested re-approval
      </p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <h2 style="color: #1a202c; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
        Student Details
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #718096; font-weight: 500;">Name:</td>
          <td style="padding: 8px 0; color: #1a202c; font-weight: 600;">${studentName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #718096; font-weight: 500;">Email:</td>
          <td style="padding: 8px 0; color: #1a202c;">${studentEmail}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #718096; font-weight: 500;">City:</td>
          <td style="padding: 8px 0; color: #1a202c;">${city}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #718096; font-weight: 500;">Institute:</td>
          <td style="padding: 8px 0; color: #1a202c;">${institute}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #718096; font-weight: 500;">Applied:</td>
          <td style="padding: 8px 0; color: #1a202c;">${appliedDate}</td>
        </tr>
      </table>
    </div>

    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin-bottom: 25px;">
      <p style="margin: 0; color: #856404; font-size: 14px;">
        <strong>⏰ Action Required:</strong> This student is waiting for approval. Please review their application as soon as possible.
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${approvalUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
        Review Application →
      </a>
    </div>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
      <p style="color: #718096; font-size: 14px; margin: 0;">
        <strong>Quick Actions:</strong>
      </p>
      <ul style="color: #718096; font-size: 14px; margin: 10px 0; padding-left: 20px;">
        <li>Review student documents and cover letter</li>
        <li>Verify student identity and credentials</li>
        <li>Approve or reject the application</li>
      </ul>
    </div>

    <div style="background: #f7fafc; padding: 15px; border-radius: 6px; margin-top: 25px;">
      <p style="color: #4a5568; font-size: 13px; margin: 0; line-height: 1.6;">
        💡 <strong>Tip:</strong> Students can see their pending status and may follow up if approval takes too long. Timely reviews help maintain a positive experience.
      </p>
    </div>
  `;

    return StartupEmailLayout(content, 'Approval Reminder - TourWiseCo', 'A student has requested re-approval');
}
