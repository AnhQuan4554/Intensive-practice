const { validationResult } = require('express-validator');
const userServices = require('../services/user.service');

const userController = {};

userController.createNew = async (req, res, next) => {
  let response;
  const { name, password, email, phone } = req.body;

  try {
    const payload = { name, password, email, phone };
    response = await userServices.createUser(payload);
    res.status(201).json(response);
  } catch (error) {
    console.log('Error request:', error);
    res.status(500).json(response);
    return next(error);
  }
};

userController.generateScript = async (req, res) => {
  const { email } = req.params;
  const response = await userServices.generateScript(email);
  return res.send(response);
};

userController.updateUser = async (req, res) => {
  let response = {
    message: 'Succeed to update user',
  };

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    response.message = 'Email is already used';
    return res.status(409).json(response);
  }

  const { name, password, email, phone, allowNotify } = req.body;
  try {
    const payload = { name, password, email, phone, allowNotify };
    response = await userServices.updateByCriteria(payload);
    if (response.data) {
      const userResponse = await userServices.fetchUserByCriteria({ email });
      const { password, ...newUserData } = userResponse.data[0]?.dataValues;
      if (newUserData) response.data = newUserData;
    }
    res.status(200).json(response);
  } catch (error) {
    console.log('Error request:', error);
    res.status(500).json(response);
    return next(error);
  }
};

module.exports = userController;
