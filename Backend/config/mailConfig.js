const nodemailer = require('nodemailer');
require("dotenv").config()
// Configure the transporter
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

module.exports = transporter