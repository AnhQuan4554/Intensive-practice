const router = require('express').Router();
const { check } = require('express-validator');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const userServices = require('../services/user.service');

router.post('/login', authController.postLogin);

router.post(
  '/register',
  check('email')
    .isEmail()
    .withMessage('Invalid email')
    .custom(async (value) => {
      const userResponse = await userServices.fetchUserByCriteria({
        email: value,
      });
      const isExistUser = userResponse.data;
      if (isExistUser) throw new Error('Email is already used');
    }),
  authController.postRegister
);

router.post('/refresh', authController.postRefresh);

router.post('/logout', authMiddleware.verifyToken, authController.postLogout);

router.get('*', authMiddleware.verifyToken, (req, res) => {
  res.status(200).json({
    data: req.currentUser,
  });
});

module.exports = router;
