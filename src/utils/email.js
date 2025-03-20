import { Resend } from "resend";

let resend = null;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

/**
 * Sends an email using the provided parameters.
 *
 * @param {Object} options - The email options.
 * @param {string|string[]} options.to - The recipient(s) of the email.
 * @param {string} options.subject - The subject of the email.
 * @param {string} options.html - The HTML content of the email.
 * @returns {Promise<void>} - A promise that resolves when the email is sent.
 */
export const sendEmail = async ({ to, subject, html }) => {
  if (!resend) {
    console.log(
      "Resend is not initialized, Please provide RESEND_API_KEY in .env file."
    );
    return;
  }

  const isSendingEmail = process.env.IS_SENDING_EMAIL === "true";
  if (!isSendingEmail) {
    console.log("IS_SENDING_EMAIL is not set, skipping email sending.");
    return;
  }

  if (!Array.isArray(to)) {
    to = [to];
  }

  await resend.emails.send({
    from: "Promaxstockcard <hello@promaxstockcard.com>",
    to,
    subject,
    html,
  });
};
