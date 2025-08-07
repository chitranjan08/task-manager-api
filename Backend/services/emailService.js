const { sendEmailTemplate } = require('./mailService');
const welcomeTemplate = require('../templates/welcomeTemplate');
const otpTemplate = require('../templates/otpTemplate');
const passwordResetTemplate = require('../templates/passwordResetTemplate');

// 🎉 Welcome Email
async function sendWelcomeEmail(user) {
  return sendEmailTemplate({
    to: user.email,
    templateFn: welcomeTemplate,
    data: { name: user.name }
  });
}

// 🔐 OTP Email
async function sendOtpEmail(user, otp) {
  return sendEmailTemplate({
    to: user.email,
    templateFn: otpTemplate,
    data: { name: user.name, otp }
  });
}

// 🔁 Password Reset Email
async function sendPasswordResetEmail(user, resetLink) {
  return sendEmailTemplate({
    to: user.email,
    templateFn: passwordResetTemplate,
    data: { name: user.name, resetLink }
  });
}

module.exports = {
  sendWelcomeEmail,
  sendOtpEmail,
  sendPasswordResetEmail
};
