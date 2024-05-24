const tokenServices = require('../services/token.service');
const userServices = require('../services/user.service');
const tokenHelper = require('../utils/token.helper');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authController = {};
const refreshKey = process.env.REFRESH_SECRET_KEY;

authController.postLogin = async (req, res, next) => {
  let response = {
    message: 'Succeed to login',
  };
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(409).json(response);
    }

    const userResponse = await userServices.fetchUserByCriteria({ email });

    if (!userResponse.data) {
      response.message = 'Not found';
      return res.status(404).json(response);
    }

    const currentUser = userResponse?.data[0]?.dataValues;
    if (!currentUser) {
      response.message = 'Not Found';
      return res.status(404).json(response);
    }

    const isMatchedPassword = await bcrypt.compare(
      password,
      currentUser.password
    );
    if (!isMatchedPassword) {
      response.message = 'You are not authenticated';
      return res.status(401).json(response);
    }

    if (currentUser && isMatchedPassword) {
      const { password, ...payload } = currentUser;

      const accessToken = tokenHelper.getAccessToken(payload);
      const refreshToken = tokenHelper.getRefreshToken(payload);

      const tokenResponse = tokenServices.createToken({
        token: refreshToken,
        userId: currentUser.id,
        expiresAt: refreshToken.exp,
      });

      if (!tokenResponse) {
        throw new Error('Failed to create token');
      }

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        path: '/',
        secure: false,
        sameSite: 'strict',
      });

      response.data = payload;
      response.meta = { accessToken };
      return res.status(200).json(response);
    }
  } catch (error) {
    throw error;
  }
};

authController.postRegister = async (req, res, next) => {
  let response = {
    message: 'Succeed to register',
  };

  try {
    const { name, password, email, phone, confirmPassword } = req.body;
    if (
      !name ||
      !password ||
      !email ||
      !phone ||
      !confirmPassword ||
      password !== confirmPassword
    ) {
      response.message = 'You must not leave out any information';
      return res.status(400).json(response);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const payload = { name, email, phone, password: hashedPassword };
    const userResponse = await userServices.createUser(payload);

    if (userResponse.data) {
      response.data = userResponse.data;
      return res.status(201).json(response);
    } else {
      throw new Error('Failed to register');
    }
  } catch (error) {
    response.message = 'Failed to register';
    throw error;
  }
};

authController.postLogout = async (req, res, next) => {
  let response = {
    message: 'Succeed to logout',
  };
  try {
    const refreshToken = req.cookies.refreshToken;
    const tokenResponse = await tokenServices.removeTokenByCriteria({
      token: refreshToken,
      userId: req.currentUser.id,
    });
    res.clearCookie('refreshToken');
    if (tokenResponse.data) response.data = tokenResponse.data;
    return res.status(200).json(response);
  } catch (error) {
    response.message = 'Failed to logout';
    throw error;
  }
};

authController.postRefresh = async (req, res, next) => {
  let response = {
    message: 'Succeed to refresh token',
  };

  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      response.message = 'You are not allowed';
      return res.status(403).json(response);
    }
    const tokenResponse = await tokenServices.fetchTokenByCriteria({ token });
    if (!tokenResponse.data) {
      response.message = 'You are not allowed';
      return res.status(403).json(response);
    }
    jwt.verify(token, refreshKey, async (error, tokenData) => {
      if (error) {
        response.message = 'You are not allowed';
        return res.status(403).json(response);
      }
      const currentUser = tokenData;
      await tokenServices.removeTokenByCriteria({
        token: token,
        userId: currentUser.id,
      });

      const { iat, exp, ...payload } = currentUser;

      const accessToken = tokenHelper.getAccessToken(payload);
      const refreshToken = tokenHelper.getRefreshToken(payload);

      const tokenResponse = tokenServices.createToken({
        token: refreshToken,
        userId: currentUser.id,
      });

      if (!tokenResponse) {
        throw new Error('Failed to create token');
      }

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        path: '/',
        secure: false,
        sameSite: 'Strict',
      });

      response.data = payload;
      response.meta = { accessToken };
      return res.status(200).json(response);
    });
  } catch (error) {
    response.message = 'Failed to refresh token';
    throw error;
  }
};
module.exports = authController;
