const UserModel = require("../models/User.model");
const userServices = {};

userServices.createUser = async (payload) => {
  const { name, password, email, phone } = payload;
  const response = {
    statusCode: 201,
    message: "Succeed to add user",
    data: {},
  };
  if (!name || !password || !email || !phone) {
    response.statusCode = 400;
    response.message = "You must not leave out any information.";
    return response;
  }
  try {
    const user = await UserModel.create(payload);
    response.data = user;
  } catch (error) {
    console.error("Error request:", error);
    response.statusCode = 500;
    response.message = "Failed to create new user";
    throw error;
  }
  return response;
};
module.exports = userServices;
