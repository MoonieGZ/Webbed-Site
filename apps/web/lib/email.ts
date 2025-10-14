import { MailerSend, EmailParams, Sender, Recipient } from "mailersend"

// Security: Outbound email only. No secrets are logged; inputs should be escaped by callers.
// API key is read from env; HTML and text are caller-provided (already sanitized where needed).

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || "",
})

const sentFrom = new Sender("noreply@mnsy.dev", "Moonsy")

export default async function sendEmail(
  email: string,
  subject: string,
  html: string,
  text: string,
) {
  const recipients = [new Recipient(email)]

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject(subject)
    .setHtml(html)
    .setText(text)

  await mailerSend.email.send(emailParams)
}
