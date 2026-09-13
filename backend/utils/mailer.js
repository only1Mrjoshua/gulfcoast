// utils/mailer.js
import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const FROM_ADDRESS =
  process.env.EMAIL_FROM || 'Gulf Coast Trust <onboarding@resend.dev>';

const REPLY_TO = process.env.EMAIL_REPLY_TO || undefined;

// ────────────────────────────────────────────────────────────────
//  HTML template
// ────────────────────────────────────────────────────────────────
const buildOTPEmailHtml = ({ name, otp, device, ip }) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:Helvetica,Arial,sans-serif;color:#1a3a3f;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;">
          <tr>
            <td style="padding:32px 40px 24px 40px;border-bottom:1px solid #e5e7eb;">
              <div style="font-size:20px;font-weight:700;color:#0f5666;letter-spacing:-0.5px;">
                Gulf Coast Trust
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px 8px 40px;">
              <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:600;color:#1a3a3f;">
                Verify your sign-in
              </h1>
              <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#4b5563;">
                Hi ${name || 'there'}, we noticed a sign-in attempt to your Gulf Coast Trust
                account from a new device or location. Enter the code below to continue.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 24px 40px;">
              <div style="background:#f8f9fa;border:1px solid #e5e7eb;padding:24px;text-align:center;">
                <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#6b7280;text-transform:uppercase;margin-bottom:12px;">
                  Your verification code
                </div>
                <div style="font-size:36px;font-weight:700;letter-spacing:12px;color:#0f5666;font-family:'Courier New',monospace;">
                  ${otp}
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 24px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#6b7280;">
                <tr>
                  <td style="padding:6px 0;"><strong style="color:#374151;">Device:</strong></td>
                  <td style="padding:6px 0;text-align:right;">${device || 'Unknown device'}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;"><strong style="color:#374151;">IP address:</strong></td>
                  <td style="padding:6px 0;text-align:right;">${ip || 'Unknown'}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;"><strong style="color:#374151;">Expires:</strong></td>
                  <td style="padding:6px 0;text-align:right;">10 minutes</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #e5e7eb;background:#f8f9fa;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">
                If you didn't try to sign in, someone may have your password. Change it
                immediately and contact us at 1-800-555-0142.
              </p>
            </td>
          </tr>
        </table>
        <div style="margin-top:16px;font-size:11px;color:#9ca3af;">
          Gulf Coast Trust · Secure Banking
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const buildOTPEmailText = ({ name, otp, device, ip }) =>
  [
    `Hi ${name || 'there'},`,
    '',
    'We noticed a sign-in attempt to your account from a new device or location.',
    'Enter the code below to continue.',
    '',
    `Your verification code: ${otp}`,
    '',
    `Device:     ${device || 'Unknown device'}`,
    `IP address: ${ip || 'Unknown'}`,
    'Expires:    10 minutes',
    '',
    "If you didn't try to sign in, someone may have your password. Change it immediately and contact us at 1-800-555-0142.",
    '',
    '— Gulf Coast Trust · Secure Banking',
  ].join('\n');

// ────────────────────────────────────────────────────────────────
//  sendOTPEmail
// ────────────────────────────────────────────────────────────────
export const sendOTPEmail = async ({ to, name, otp, device, ip }) => {
  // No key configured → print to console so local dev still works
  if (!resend) {
    console.log('\n📧 ⚠️  RESEND_API_KEY not set. OTP printed to console:\n');
    console.log(`   → ${otp}  (for ${to})\n`);
    return { delivered: false, reason: 'resend-not-configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      subject: 'Your Gulf Coast Trust verification code',
      html: buildOTPEmailHtml({ name, otp, device, ip }),
      text: buildOTPEmailText({ name, otp, device, ip }),
      reply_to: REPLY_TO,
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      console.log(`\n📧 OTP for ${to} (Resend rejected the send): ${otp}\n`);
      return { delivered: false, reason: error.message || 'resend-error' };
    }

    console.log(`📧 OTP email sent to ${to} — id ${data?.id}`);
    return { delivered: true, id: data?.id };
  } catch (err) {
    console.error('❌ sendOTPEmail threw:', err.message);
    console.log(`\n📧 OTP for ${to} (thrown exception): ${otp}\n`);
    return { delivered: false, reason: err.message };
  }
};