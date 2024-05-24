const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/login', authController.postLogin);

router.post('/register', authController.postRegister);

router.post('/refresh', authController.postRefresh);

router.post('/logout', authMiddleware.verifyToken, authController.postLogout);

router.get('*', authMiddleware.verifyToken, (req, res) => {
  res.status(200).json({
    data: req.currentUser,
  });
});

module.exports = router;
