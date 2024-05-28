const { Op } = require('sequelize');
const UserModel = require('../models/User.model');
const TokenModel = require('../models/Token.model');

const tokenServices = {};

tokenServices.createToken = async (payload) => {
  const { token, userId, expiresAt } = payload;
  const response = {
    statusCode: 201,
    message: 'Succeed to create a token data',
  };

  try {
    const requirements = { token, userId, expiresAt };
    const user = await UserModel.findByPk(userId);
    if (!user) {
      response.statusCode = 404;
      response.message = "User's not found";
      return response;
    }

    const tokenData = await user.createToken(requirements);
    if (tokenData) {
      response.data = tokenData;
    }
  } catch (error) {
    response.statusCode = 500;
    response.message = 'Failed to create a token data';
    throw error;
  }
};

tokenServices.removeTokenByCriteria = async (payload) => {
  const response = {
    statusCode: 200,
    message: 'Succeed to remove token',
  };
  const { userId, token } = payload;
  if (!userId && !token) {
    response.statusCode = 404;
    response.message = 'Not Found';
    return response;
  }

  try {
    // Condition
    const whereCondition = { [Op.or]: [] };
    if (token) whereCondition[Op.or].push({ token });
    if (userId) whereCondition[Op.or].push({ userId });
    const tokens = await TokenModel.destroy({
      where: whereCondition,
    });
    response.data = tokens;
    return response;
  } catch (error) {
    response.statusCode = 500;
    response.message = 'Failed to remove token';
    throw error;
  }
};

tokenServices.fetchTokenByCriteria = async (payload) => {
  const response = {
    statusCode: 200,
    message: 'Succeed to get token',
    data: null,
    meta: {},
  };
  try {
    const searchCriteria = payload;
    if (
      !searchCriteria ||
      typeof searchCriteria !== 'object' ||
      Object.keys(searchCriteria).length === 0
    ) {
      response.statusCode = 422; //  Unprocessable Entity
      response.message = 'Invalid search criteria.';
      return response;
    } else {
      let condition = {};
      let whereCondition = {};
      let orderCondition = [];
      // WHERE condition
      if (searchCriteria.userId) {
        whereCondition.userId = searchCriteria.userId;
      }
      if (searchCriteria.token) {
        whereCondition.token = searchCriteria.token;
      }

      // ORDER condition
      let { orderBy, orderDirection } = searchCriteria;
      if (!orderDirection || !['DESC', 'ASC'].includes(orderDirection))
        orderDirection = 'DESC';
      if (!orderBy) orderBy = 'createdAt';
      if (orderBy && orderDirection) {
        const direction = orderDirection.toString().toUpperCase();
        orderCondition.push([`${orderBy}`, `${direction}`]);
      }

      //
      if (Object.keys(whereCondition).length !== 0)
        condition.where = whereCondition;
      if (orderCondition.length !== 0) condition.order = orderCondition;

      // Query
      const totalData = await TokenModel.count(condition);
      // Pagination
      let { page, pageSize } = searchCriteria;
      if (!page) page = 1;
      if (!pageSize) pageSize = 10;
      condition.limit = pageSize;
      condition.offset = (page - 1) * pageSize;
      // Query
      const tokens = await TokenModel.findAll(condition);

      if (tokens?.length > 0) {
        response.data = tokens;
      }
      response.meta.pagination = {
        count: tokens.length,
        total: totalData,
        pageSize,
        currentPage: page,
        totalPage: Math.ceil(totalData / pageSize),
        hasNext: page * pageSize < totalData,
        hasPrevious: page > 1,
      };
    }
    return response;
  } catch (error) {
    response.statusCode = 500;
    response.message = 'Failed to get data device';
    throw error;
  }
};

module.exports = tokenServices;
