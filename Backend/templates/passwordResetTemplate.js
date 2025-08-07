module.exports = ({ name, resetLink }) => {
  return {
    subject: '🔁 Password Reset Instructions',
    text: `Hi ${name}, click here to reset your password: ${resetLink}`,
    html: `
      <h2>Hi ${name}</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you didn’t request this, ignore this email.</p>
    `
  };
};
