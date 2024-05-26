const UserModel = require("../models/User.model");
const userServices = {};
const { Client } = require("intercom-client");
const { INTERCOM_TOKEN, APP_ID } = process.env;

const client = new Client({ tokenAuth: { token: INTERCOM_TOKEN } });

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
    console.error("Error request:", error);
    response.statusCode = 500;
    response.message = "Failed to create new user";
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
      if (!contactId || contactId == "" || contactId == null) {
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
    console.error("Error:", error);
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

module.exports = userServices;
