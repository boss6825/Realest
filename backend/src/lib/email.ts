import { Resend } from 'resend';
import { config } from '../config';

const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;

function verificationHtml(name: string, verifyUrl: string): string {
  return `
  <div style="background:#FAFAFA;padding:32px 16px;font-family:'Work Sans',-apple-system,'Segoe UI',Helvetica,sans-serif;color:#0A0A0A;">
    <div style="max-width:520px;margin:0 auto;background:#FAFAFA;border:2px solid #0A0A0A;">
      <div style="border-bottom:4px solid #EF4444;padding:24px 32px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#EF4444;">Dealer Network</div>
        <div style="font-family:'Archivo Black',Impact,'Arial Black',sans-serif;font-size:32px;line-height:1.05;margin-top:4px;">REALEST</div>
      </div>
      <div style="padding:32px;">
        <h1 style="font-family:'Archivo Black',Impact,'Arial Black',sans-serif;font-size:24px;line-height:1.2;margin:0 0 16px;">Verify your account</h1>
        <p style="font-size:16px;line-height:1.7;margin:0 0 24px;">Hi ${name}, welcome to Realest. Confirm your email to start listing inventory and discovering deals across districts.</p>
        <a href="${verifyUrl}" style="display:inline-block;background:#0A0A0A;color:#FAFAFA;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:14px 32px;border:2px solid #0A0A0A;">Verify Email</a>
        <p style="font-size:12px;line-height:1.6;color:#525252;margin:24px 0 0;">Or paste this link into your browser:</p>
        <p style="font-family:'Space Mono','Courier New',monospace;font-size:12px;line-height:1.6;color:#525252;word-break:break-all;margin:4px 0 0;">${verifyUrl}</p>
        <p style="font-size:12px;line-height:1.6;color:#A3A3A3;margin:24px 0 0;">This link expires in 24 hours. If you didn't create a Realest account, ignore this email.</p>
      </div>
    </div>
  </div>`;
}

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const verifyUrl = `${config.backendUrl}/auth/verify?token=${token}`;

  if (!resend) {
    // Dev fallback: no Resend key configured, so log the link to verify by hand.
    console.log('\n──────────────────────────────────────────────');
    console.log('[email] RESEND_API_KEY not set — verification link:');
    console.log(`[email] to:     ${to}`);
    console.log(`[email] verify: ${verifyUrl}`);
    console.log('──────────────────────────────────────────────\n');
    return;
  }

  const { error } = await resend.emails.send({
    from: config.emailFrom,
    to,
    subject: 'Verify your Realest account',
    html: verificationHtml(name, verifyUrl),
  });

  if (error) {
    throw new Error(`Resend error: ${JSON.stringify(error)}`);
  }
}
