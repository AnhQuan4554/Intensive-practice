import sendRequest from '@/utils/httpRequest';
import authAxios from './authAxios';
const sensorServices = {};

sensorServices.getSensorData = async ({ method, token, data, params, path, allowLog }) => {
  let response;
  try {
    response = await sendRequest({ method: 'GET', data, token, path: '/sensor/data', params, allowLog });
    return response;
  } catch (error) {
    throw error;
  }
};

sensorServices.deleteSensorData = async (params) => {
  const url = '/sensor/data/delete';
  return authAxios.delete(url, { params, withCredentials: true });
};

export default sensorServices;
