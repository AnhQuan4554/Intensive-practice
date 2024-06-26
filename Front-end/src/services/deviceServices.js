import sendRequest from '@/utils/httpRequest';
import authAxios from './authAxios';
const deviceServices = {};

deviceServices.updateDeviceStatus = async ({ method, token, data, params, path, allowLog }) => {
  const url = '/device/update-status';
  return authAxios.put(url, data, {
    withCredentials: true,
  });
};

deviceServices.getDevice = async ({ method, token, data, params, path, allowLog }) => {
  let response;
  try {
    response = await sendRequest({
      method: 'GET',
      data,
      token,
      path: `/device${path ? '/' + path : ''}`,
      params,
      allowLog,
    });
  } catch (error) {
    throw error;
  }
  return response;
};

deviceServices.getAllDevices = async ({ method, token, data, params, path, allowLog }) => {
  let response;
  try {
    response = await sendRequest({
      method: 'GET',
      data,
      token,
      path: `/device`,
      params,
      allowLog,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

deviceServices.getDataAction = async ({ method, token, data, params, path, allowLog }) => {
  let response;
  try {
    response = await sendRequest({ method: 'GET', data, token, path: '/device/action', params, allowLog });
    return response;
  } catch (error) {
    throw error;
  }
};

deviceServices.deleteActionData = async (params) => {
  const url = '/device/action/delete';
  return authAxios.delete(url, { params });
};

export default deviceServices;
