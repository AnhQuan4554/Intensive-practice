const UserModel = require('../models/User.model');
const userServices = {};
const { Client } = require('intercom-client');
const { INTERCOM_TOKEN, APP_ID } = process.env;

const client = new Client({ tokenAuth: { token: INTERCOM_TOKEN } });

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
    // create contact for user
    const userId = user.id;
    const intercomContact = await createIntercomContact(user);
    //update field contactId for user
    await UserModel.update(
      { contactId: intercomContact.id },
      { where: { id: userId } }
    );
    response.data = user;
  } catch (error) {
    console.error('Error request:', error);
    response.statusCode = 500;
    response.message = 'Failed to create new user';
    throw error;
  }
  return response;
};

userServices.generateScript = async (email) => {
  try {
    const user = await UserModel.findOne({
      where: {
        email: email,
      },
    });
    if (user) {
      const { contactId, id } = user;
      if (!contactId || contactId == '' || contactId == null) {
        const intercomContact = await createIntercomContact(user);
        await UserModel.update(
          { contactId: intercomContact.id },
          { where: { id: id } }
        );
      }
      const intercomScript = `
    window.intercomSettings = {
      api_base: "https://api-iam.intercom.io",
      app_id: "${APP_ID}",
      name: "${user.name}", // Full name
      user_id: "${user.id}", // a UUID for your user
      email: "${user.email}", // the email for your user
      created_at: ${new Date(
        user.createdAt
      ).getTime()} // Signup date as a Unix timestamp
    };
    // We pre-filled your app ID in the widget URL: 'https://widget.intercom.io/widget/${APP_ID}'
    (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${APP_ID}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
    `;
      return intercomScript;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

const createIntercomContact = async (user) => {
  const { id, email, name, createdAt } = user;
  const newContact = await client.contacts.createUser({
    externalId: id + email,
    email: email,
    name: name,
    signedUpAt: createdAt,
  });
  return newContact;
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

      if (users?.length > 0) {
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
