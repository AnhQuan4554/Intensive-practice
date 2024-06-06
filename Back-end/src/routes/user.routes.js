const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const userServices = require('../services/user.service');

// CREATE a new device
router.post('/create', userController.createNew);
// UPDATE an exist user
router.put(
  '/update',
  authMiddleware.verifyToken,
  check('email')
    .isEmail()
    .withMessage('Invalid Email!')
    .custom(async (value, { req }) => {
      if (value !== req?.currentUser?.email) {
        const userResponse = await userServices.fetchUserByCriteria({
          email: value,
        });
        const isExistUser = userResponse.data;
        if (isExistUser) throw new Error('Email is already used');
      }
    }),
  userController.updateUser
);

router.get('/script/:email', userController.generateScript);

router.get('/', (req, res) => {
  res.send('okoko');
});

module.exports = router;
