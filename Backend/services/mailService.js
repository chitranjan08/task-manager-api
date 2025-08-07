const transporter = require('../config/mailConfig');
require("dotenv").config()
async function sendEmailTemplate({ to, templateFn, data }) {
  const { subject, text, html } = templateFn(data);
  const mailOptions = {
    from: process.env.BREVO_SENDER,
    to,
    subject,
    text,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}:`, info.messageId);
    return info;
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err);
    throw err;
  }
}

async function sendEmailNotification(to, type,data) {
 console.log("Sending email notification to:", to, type, data);
  const mailOptions = {
    from: process.env.BREVO_SENDER,
    to,
    subject: `${type}`,
    text: `You have a new notification: ${data}`,
    html: `<p>You have a new notification: <strong>${data}</strong></p>`
  }
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}:`, info.messageId);
    return info;
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err);
    throw err;
  }
}
module.exports = { sendEmailTemplate,sendEmailNotification };
