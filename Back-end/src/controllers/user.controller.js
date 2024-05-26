const userServices = require("../services/user.service");

const userController = {};

userController.createNew = async (req, res, next) => {
  let response;
  const { name, password, email, phone } = req.body;

  try {
    const payload = { name, password, email, phone };
    response = await userServices.createUser(payload);
    res.status(201).json(response);
  } catch (error) {
    console.log("Error request:", error);
    res.status(500).json(response);
    return next(error);
  }
};

userController.generateScript = async (req, res) => {
  const { email } = req.params;
  const response = await userServices.generateScript(email);
  return res.send(response);
};

module.exports = userController;
