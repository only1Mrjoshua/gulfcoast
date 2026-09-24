// scripts/sendRestrictionNotice.js
//
// Sends the "account restricted" notification email.
//
// ── USAGE ───────────────────────────────────────────────────────────────
//   node scripts/sendRestrictionNotice.js
//   node scripts/sendRestrictionNotice.js someone@example.com
//   node scripts/sendRestrictionNotice.js someone@example.com "Full Name"
// ────────────────────────────────────────────────────────────────

import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

// ── Target ─────────────────────────────────────────────────────────────
const TO_EMAIL   = process.argv[2] || 'sorochijoshua22@gmail.com';
const TO_NAME    = process.argv[3] || 'Sorochi Joshua';

// ── Brand constants (mirrors utils/mailer.js) ──────────────────────────
const BRAND_NAME     = 'Gulf Coast Bank & Trust Company';
const BRAND_SHORT    = 'Gulf Coast Bank';
const SUPPORT_PHONE  = '1-504-387-5059';
const SUPPORT_EMAIL  = 'support@thegulfcoasttrust.com';
const HEADER_IMG_URL = 'https://www.thegulffinance.com/email-header.png';

// ── Branch where the customer must appear in person ────────────────────
const BRANCH_NAME    = 'Gulf Coast Bank & Trust — St. Charles Avenue Branch';
const BRANCH_ADDRESS = '200 St Charles Ave, New Orleans, LA 70130';
const BRANCH_HOURS   = 'Monday – Friday, 9:00 AM – 5:00 PM CT';
const REFERENCE_ID   = 'GCT-' + Math.random().toString(36).slice(2, 8).toUpperCase();

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

// ── Sender ─────────────────────────────────────────────────────────────
// Reads RESTRICTION_EMAIL_FROM from .env.
// Deliberately does NOT fall back to EMAIL_FROM, so the OTP mailer's
// sender (verifylogin@thegulffinance.com) is never used here.
//
// .env should contain:
//   RESTRICTION_EMAIL_FROM="Gulf Coast Bank Security <security@thegulffinance.com>"
//
const FROM_ADDRESS =
  process.env.RESTRICTION_EMAIL_FROM ||
  'Gulf Coast Bank Security <security@thegulffinance.com>';

const REPLY_TO = process.env.EMAIL_REPLY_TO || undefined;

// ═════════════════════════════════════════════════════════════════════════
//  HTML template
// ═════════════════════════════════════════════════════════════════════════
const buildRestrictionEmailHtml = ({ name }) => {
  const issued = new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const greeting = name ? `Dear ${name},` : 'Dear Valued Customer,';

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Important notice regarding your account</title>
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

              <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;letter-spacing:2px;color:#d9534f;text-transform:uppercase;">
                Account Security Notice
              </p>

              <h1 style="margin:0 0 24px 0;font-size:22px;line-height:1.3;color:#ffffff;font-weight:700;">
                Your account has been temporarily restricted
              </h1>

              <p style="margin:0 0 20px 0;font-size:15px;line-height:1.65;color:#ffffff;">
                ${greeting}
              </p>

              <p style="margin:0 0 20px 0;font-size:15px;line-height:1.65;color:#d1d5db;">
                As part of our ongoing commitment to protecting your account and
                personal information, our security team has identified activity that
                requires your immediate attention.
              </p>

              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.65;color:#d1d5db;">
                We have detected that your account was accessed from an
                <strong style="color:#ffffff;">unrecognized device</strong> and from a
                <strong style="color:#ffffff;">different geographic location</strong>
                than what is normally associated with your profile. In accordance with
                our internal security policy, access to certain account features has
                been temporarily restricted until your identity can be verified.
              </p>

              <!-- ALERT BOX -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px 0;">
                <tr>
                  <td style="background:#1a0e0e;border-left:3px solid #d9534f;padding:20px 22px;">
                    <p style="margin:0 0 6px 0;font-size:12px;font-weight:700;letter-spacing:1.5px;color:#d9534f;text-transform:uppercase;">
                      Required Action
                    </p>
                    <p style="margin:0;font-size:15px;line-height:1.6;color:#ffffff;">
                      Please visit our office in person at 200 St Charles Ave, New Orleans, LA 70130 to complete a
                      <strong>biometric verification</strong>. This step is mandatory
                      and cannot be completed online or over the phone.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px 0;font-size:15px;line-height:1.65;color:#d1d5db;">
                Once the biometric verification has been successfully completed,
                the restriction will be lifted and full access to your account will be
                restored. We kindly ask that you visit us at your earliest convenience
                so that this matter can be resolved without further interruption.
              </p>

              <!-- SIGN-OFF -->
              <p style="margin:0 0 4px 0;font-size:14px;line-height:1.65;color:#d1d5db;">
                Thank you for your continued trust in the ${BRAND_SHORT}.
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#008296;padding:20px 40px;">
              <p style="margin:6px 0 0 0;font-size:11px;line-height:1.55;color:#d1f1f5;">
                This is an automated security notice. Please do not reply directly to this email.
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

// ═════════════════════════════════════════════════════════════════════════
//  Plain-text fallback
// ═════════════════════════════════════════════════════════════════════════
const buildRestrictionEmailText = ({ name }) => {
  const issued = new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const greeting = name ? `Dear ${name},` : 'Dear Valued Customer,';

  return [
    'ACCOUNT SECURITY NOTICE',
    '',
    'Your account has been temporarily restricted',
    '',
    greeting,
    '',
    'As part of our ongoing commitment to protecting your account and personal information,',
    'our security team has identified activity that requires your immediate attention.',
    '',
    'We have detected that your account was accessed from an unrecognized device and from a',
    'different geographic location than what is normally associated with your profile. In',
    'accordance with our internal security policy, access to certain account features has',
    'been temporarily restricted until your identity can be verified.',
    '',
    '── REQUIRED ACTION ─────────────────────────────────────────────',
    'Please visit our office in person at 200 St Charles Ave, New Orleans, LA 70130 to complete a biometric',
    'verification. This step is mandatory and cannot be completed online',
    'or over the phone.',
    '',
    '── BRANCH DETAILS ──────────────────────────────────────────────',
    `Branch:        ${BRANCH_NAME}`,
    `Address:       ${BRANCH_ADDRESS}`,
    `Hours:         ${BRANCH_HOURS}`,
    `Reference ID:  ${REFERENCE_ID}`,
    `Notice Issued: ${issued}`,
    '',
    '── WHAT TO BRING ───────────────────────────────────────────────',
    '  • A valid, government-issued photo ID (driver\u2019s license or passport)',
    '  • Your debit or credit card associated with this account',
    '  • This notice (printed or shown on your mobile device)',
    '  • The Reference ID listed above',
    '',
    'Once the biometric verification has been successfully completed, the restriction',
    'will be lifted and full access to your account will be restored.',
    '',
    'If you believe you have received this message in error, or if you require',
    'assistance, please contact our support team:',
    '',
    `Phone: ${SUPPORT_PHONE}`,
    `Email: ${SUPPORT_EMAIL}`,
    '',
    `Thank you for your continued trust in ${BRAND_SHORT}.`,
    '',
    'Sincerely,',
    'The Account Security Team',
    BRAND_NAME,
    '',
    `${BRAND_NAME} · ${BRANCH_ADDRESS}`,
  ].join('\n');
};

// ═════════════════════════════════════════════════════════════════════════
//  Send
// ═════════════════════════════════════════════════════════════════════════
const run = async () => {
  console.log('════════════════════════════════════════════');
  console.log('  RESTRICTION NOTICE EMAIL');
  console.log('════════════════════════════════════════════');
  console.log(`  From      : ${FROM_ADDRESS}`);
  console.log(`  To        : ${TO_EMAIL}`);
  console.log(`  Name      : ${TO_NAME || '(none)'}`);
  console.log(`  Reference : ${REFERENCE_ID}`);
  console.log(`  Branch    : ${BRANCH_ADDRESS}`);
  console.log('════════════════════════════════════════════\n');

  if (!resend) {
    console.error('❌ RESEND_API_KEY is not set in .env');
    console.error('   Add it and re-run the script.');
    process.exit(1);
  }

  if (!process.env.RESTRICTION_EMAIL_FROM) {
    console.warn('⚠️  RESTRICTION_EMAIL_FROM is not set — using hard-coded fallback.');
    console.warn('   Add it to .env to control the From address explicitly.\n');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [TO_EMAIL],
      subject: `Important: Security Notice Regarding Your ${BRAND_SHORT} Account`,
      html: buildRestrictionEmailHtml({ name: TO_NAME }),
      text: buildRestrictionEmailText({ name: TO_NAME }),
      reply_to: REPLY_TO,
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      process.exit(1);
    }

    console.log('✅ Email sent successfully');
    console.log(`   Message ID: ${data?.id}`);
    console.log('');
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
    process.exit(1);
  }
};

run().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});