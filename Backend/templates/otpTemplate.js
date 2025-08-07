module.exports = ({ name, otp }) => {
  return {
    subject: '🔐 Your OTP Code',
    text: `Hello ${name}, your OTP is ${otp}`,
    html: `
      <h2>Hello, ${name}</h2>
      <p>Your OTP code is:</p>
      <h3>${otp}</h3>
      <p>This will expire in 10 minutes.</p>
    `
  };
};
