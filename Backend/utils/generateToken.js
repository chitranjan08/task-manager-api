const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateAccessToken = (userId, role) =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: '10s',
  });

const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

module.exports = { generateAccessToken, generateRefreshToken };
