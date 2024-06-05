import axios from 'axios';
import queryString from 'query-string';
import { jwtDecode } from 'jwt-decode';
import authServices from './authServices';
import { myHistory } from '@/utils/history';

const authAxios = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: (params) => queryString.stringify(params),
});

let refreshTokenRequest = null;
authAxios.interceptors.request.use(async (config) => {
  let accessToken = localStorage.getItem('accessToken');
  let decodedToken = jwtDecode(accessToken);
  let currentTime = new Date();
  if (decodedToken?.exp < currentTime.getTime() / 1000) {
    refreshTokenRequest = refreshTokenRequest ? refreshTokenRequest : authServices.refresh();
    try {
      const response = await refreshTokenRequest;
      accessToken = response?.meta?.accessToken;
    } catch (error) {
      console.log('Failed to refresh token', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('currentUser');
      myHistory.replace('/auth/login');
    }
  }
  refreshTokenRequest = null;
  config.headers.Authorization = `Bearer ${accessToken}`;

  console.log('config', config);
  return config;
});

authAxios.interceptors.response.use(
  (response) => {
    if (response && response.data) return response.data;
    return response;
  },
  (error) => {
    throw error;
  },
);

export default authAxios;
