const UserModel = require('../models/User.model');
const userServices = {};

userServices.createUser = async (payload) => {
  const { name, password, email, phone } = payload;
  const response = {
    statusCode: 201,
    message: 'Succeed to add user',
  };
  if (!name || !password || !email || !phone) {
    response.statusCode = 400;
    response.message = 'You must not leave out any information.';
    return response;
  }
  try {
    const user = await UserModel.create(payload);
    if (user) response.data = user;
  } catch (error) {
    console.error('Error request:', error);
    response.statusCode = 500;
    response.message = 'Failed to create new user';
    throw error;
  }
  return response;
};

userServices.fetchUserByCriteria = async (payload) => {
  const response = {
    statusCode: 200,
    message: 'Succeed to get user',
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
      response.statusCode = 422;
      response.message = 'Invalid search criteria.';
    } else {
      let condition = {};
      let whereCondition = {};
      let orderCondition = [];

      // WHERE condition
      if (searchCriteria.userId) {
        whereCondition.userId = searchCriteria.userId;
      }

      if (searchCriteria.email) {
        whereCondition.email = searchCriteria.email;
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

      // QUERY
      const totalData = await UserModel.count(condition);

      // Pagination
      let { page, pageSize } = searchCriteria;
      if (!page) page = 1;
      if (!pageSize) pageSize = 10;
      condition.limit = pageSize;
      condition.offset = (page - 1) * pageSize;
      // Query
      const users = await UserModel.findAll(condition);

      if (users.length > 0) {
        response.data = users;
      }

      response.meta.pagination = {
        count: users.length,
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
    response.message = 'Failed to get user';
    throw error;
  }
};

module.exports = userServices;
