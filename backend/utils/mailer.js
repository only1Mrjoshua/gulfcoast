// utils/mailer.js
import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const FROM_ADDRESS =
  process.env.EMAIL_FROM || 'Gulf Coast Bank & Trust Company <onboarding@resend.dev>';

const REPLY_TO = process.env.EMAIL_REPLY_TO || undefined;

// ────────────────────────────────────────────────────────────────
//  Logo is now served from your own frontend domain.
//  Change this URL if your domain changes.
// ────────────────────────────────────────────────────────────────
const LOGO_URL = 'https://www.thegulffinance.com/logo.svg';
const HEADER_IMG_URL = 'https://www.thegulffinance.com/email-header.png';

const BRAND_NAME = 'Gulf Coast Bank & Trust Company';
const BRAND_SHORT = 'Gulf Coast Bank';
const SUPPORT_PHONE = '1-504-387-5059';
const SUPPORT_EMAIL = 'support@thegulfcoasttrust.com';
const BRAND_ADDRESS = '1420 Bienville Blvd, Mobile, AL 36604, USA';

// ────────────────────────────────────────────────────────────────
//  HTML template
// ────────────────────────────────────────────────────────────────
const buildOTPEmailHtml = ({ name, otp, device, ip }) => {
  const requested = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const spacedOtp = String(otp || '').split('').join(' ');

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your verification code</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:Helvetica,Arial,sans-serif;color:#ffffff;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:0;margin:0;">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#000000;max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td align="center" style="padding:0;margin:0;">
              <img
                src="${HEADER_IMG_URL}"
                alt="${BRAND_NAME}"
                width="600"
                style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;"
              />
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#000000;padding:36px 40px 0 40px;color:#ffffff;">

              <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#ffffff;">
                Dear <strong>${name || 'Customer'}</strong>,
              </p>

              <p style="margin:0 0 32px 0;font-size:15px;line-height:1.6;color:#d1d5db;">
                We received a request to sign in to your
                ${BRAND_SHORT} account from a new device or location.
                Use the verification code below to complete your
                sign-in. This code expires in
                <strong style="color:#ffffff;">10 minutes</strong>.
              </p>

              <!-- OTP BOX -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px 0;">
                <tr>
                  <td align="center" style="background:#111111;border:1px solid #1f2937;padding:28px 20px;">
                    <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;margin-bottom:16px;">
                      Your Verification Code
                    </div>
                    <div style="font-size:40px;font-weight:700;letter-spacing:10px;color:#ffffff;font-family:'Courier New',Courier,monospace;line-height:1.1;">
                      ${spacedOtp}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- REQUEST DETAILS -->
              <p style="margin:0 0 20px 0;font-size:15px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                Request Details:
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px 0;font-size:14px;">
                <tr>
                  <td style="padding:7px 0;color:#9ca3af;width:42%;">Name:</td>
                  <td style="padding:7px 0;color:#ffffff;font-weight:700;">${name || '—'}</td>
                </tr>
                <tr>
                  <td style="padding:7px 0;color:#9ca3af;">Device:</td>
                  <td style="padding:7px 0;color:#ffffff;font-weight:700;">${device || 'Unknown device'}</td>
                </tr>
                <tr>
                  <td style="padding:7px 0;color:#9ca3af;">IP Address:</td>
                  <td style="padding:7px 0;color:#ffffff;font-weight:700;">${ip || 'Unknown'}</td>
                </tr>
                <tr>
                  <td style="padding:7px 0;color:#9ca3af;">Requested:</td>
                  <td style="padding:7px 0;color:#ffffff;font-weight:700;">${requested}</td>
                </tr>
                <tr>
                  <td style="padding:7px 0;color:#9ca3af;">Expires In:</td>
                  <td style="padding:7px 0;color:#ffffff;font-weight:700;">10 minutes</td>
                </tr>
              </table>

              <!-- SUPPORT -->
              <p style="margin:0 0 12px 0;font-size:14px;line-height:1.65;color:#d1d5db;">
                If you did not request this code, please ignore this email
                or contact our support team through the following channels:
              </p>
              <p style="margin:0 0 4px 0;font-size:14px;line-height:1.65;color:#d1d5db;">
                Phone: <strong style="color:#ffffff;">${SUPPORT_PHONE}</strong>
              </p>
              <p style="margin:0 0 32px 0;font-size:14px;line-height:1.65;color:#d1d5db;">
                Email: <a href="mailto:${SUPPORT_EMAIL}" style="color:#008296;text-decoration:none;font-weight:700;">${SUPPORT_EMAIL}</a>
              </p>

              <!-- SIGN-OFF -->
              <p style="margin:0 0 4px 0;font-size:14px;line-height:1.65;color:#d1d5db;">
                Thank you for choosing ${BRAND_SHORT}.
              </p>
              <p style="margin:0 0 36px 0;font-size:14px;line-height:1.65;color:#d1d5db;">
                The ${BRAND_SHORT} Team
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#008296;padding:20px 40px;">
              <p style="margin:0;font-size:12px;line-height:1.55;color:#ffffff;">
                ${BRAND_NAME} &middot; ${BRAND_ADDRESS}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

// ────────────────────────────────────────────────────────────────
//  Plain-text fallback (unchanged)
// ────────────────────────────────────────────────────────────────
const buildOTPEmailText = ({ name, otp, device, ip }) => {
  const requested = new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });

  return [
    `Dear ${name || 'Customer'},`,
    '',
    `We received a request to sign in to your ${BRAND_SHORT} account from a new device or location.`,
    'Use the verification code below to complete your sign-in. This code expires in 10 minutes.',
    '',
    `Your verification code: ${otp}`,
    '',
    'Request Details:',
    `Name:       ${name || '—'}`,
    `Device:     ${device || 'Unknown device'}`,
    `IP Address: ${ip || 'Unknown'}`,
    `Requested:  ${requested}`,
    'Expires In: 10 minutes',
    '',
    'If you did not request this code, please ignore this email or contact support:',
    `Phone: ${SUPPORT_PHONE}`,
    `Email: ${SUPPORT_EMAIL}`,
    '',
    `Thank you for choosing ${BRAND_SHORT}.`,
    `The ${BRAND_SHORT} Team`,
    '',
    `${BRAND_NAME} · ${BRAND_ADDRESS}`,
  ].join('\n');
};

// ────────────────────────────────────────────────────────────────
//  sendOTPEmail — NO attachments, NO CID, just a URL
// ────────────────────────────────────────────────────────────────
export const sendOTPEmail = async ({ to, name, otp, device, ip }) => {
  if (!resend) {
    console.log('\n[MAILER] RESEND_API_KEY not set. OTP printed to console:\n');
    console.log(`   -> ${otp}  (for ${to})\n`);
    return { delivered: false, reason: 'resend-not-configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      subject: `Your ${BRAND_NAME} verification code`,
      html: buildOTPEmailHtml({ name, otp, device, ip }),
      text: buildOTPEmailText({ name, otp, device, ip }),
      reply_to: REPLY_TO,
      // ⬅️ no attachments — the logo is a normal <img src="https://...">
    });

    if (error) {
      console.error('[MAILER] Resend API error:', error);
      console.log(`\n[MAILER] OTP for ${to} (Resend rejected the send): ${otp}\n`);
      return { delivered: false, reason: error.message || 'resend-error' };
    }

    console.log(`[MAILER] OTP email sent to ${to} - id ${data?.id}`);
    return { delivered: true, id: data?.id };
  } catch (err) {
    console.error('[MAILER] sendOTPEmail threw:', err.message);
    console.log(`\n[MAILER] OTP for ${to} (thrown exception): ${otp}\n`);
    return { delivered: false, reason: err.message };
  }
};