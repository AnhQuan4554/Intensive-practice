import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  // Không thiết lập header ở đây
});

async function sendRequest({ path, method, token = null, data = null, params = null, allowLog, ...props }) {
  try {
    const configs = {
      method,
      url: path,
      params,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(data && { 'Content-Type': 'application/json' }), // Chỉ thêm header này nếu có data
      },
      data,
      ...props,
    };

    if (allowLog) console.log('configs', configs);

    const response = await instance.request(configs);
    return response.data;
  } catch (error) {
    throw error.response;
  }
}

export default sendRequest;
