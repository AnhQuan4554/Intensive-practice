const jwt = require('jsonwebtoken');

const tokenHelper = {};
const accessKey = process.env.ACCESS_SECRET_KEY;
const refreshKey = process.env.REFRESH_SECRET_KEY;

tokenHelper.getAccessToken = (payload) => {
  const accessToken = jwt.sign(payload, accessKey, {
    expiresIn: '3h',
  });
  return accessToken;
};

tokenHelper.getRefreshToken = (payload) => {
  const refreshToken = jwt.sign(payload, refreshKey, {
    expiresIn: '7d',
  });
  return refreshToken;
};

module.exports = tokenHelper;
