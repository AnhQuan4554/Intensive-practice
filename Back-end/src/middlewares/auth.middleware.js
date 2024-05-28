const jwt = require('jsonwebtoken');
const authMiddleware = {};

const accessKey = process.env.ACCESS_SECRET_KEY;

authMiddleware.verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({
      message: 'You are not authenticated',
    });
  }

  const accessToken = token?.split(' ')[1];
  jwt.verify(accessToken, accessKey, (error, tokenData) => {
    if (error) {
      return res.status(403).json({
        message: 'You are not allowed',
      });
    }
    req.currentUser = tokenData;
    next();
  });
};

module.exports = authMiddleware;
