import authAxios from './authAxios';

const userServices = {};

userServices.updateUser = (data) => {
  const url = '/user/update';
  return authAxios.put(url, data, {
    withCredentials: true,
  });
};

export default userServices;
