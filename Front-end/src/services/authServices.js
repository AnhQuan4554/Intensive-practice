import sendRequest from '@/utils/httpRequest';
import authAxios from './authAxios';

const authServices = {};

authServices.loginUser = async (data) => {
  let response;
  try {
    response = await sendRequest({
      method: 'POST',
      path: '/auth/login',
      data,
      withCredentials: true,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

authServices.registerUser = async (data) => {
  let response;
  try {
    response = await sendRequest({
      method: 'POST',
      path: '/auth/register',
      allowLog: true,
      data,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

authServices.logoutUser = async () => {
  return authAxios.post(
    '/auth/logout',
    {},
    {
      withCredentials: true,
    },
  );
};

authServices.refresh = async () => {
  let response;
  try {
    response = await sendRequest({
      method: 'POST',
      path: '/auth/refresh',
      allowLog: false,
      data: {},
      withCredentials: true,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export default authServices;
