import React, { useContext, useState } from 'react';
import classNames from 'classnames/bind';

import { Button, Flex, Input, Space, message } from 'antd';
import { FiUser } from 'react-icons/fi';
import { MdOutlineAttachEmail } from 'react-icons/md';

import styles from './Login.module.scss';
import authServices from '@/services/authServices';
import { AuthContext } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

const Login = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { handleSetCurrentUser } = useContext(AuthContext);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValues, setInputValues] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (error) setError(false);
    setInputValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const formData = { email: inputValues.email, password: inputValues.password };
    setIsLoading(true);
    authServices
      .loginUser(formData)
      .then((response) => {
        console.log('Login', response);
        messageApi.success(response.message);
        setTimeout(() => {
          const currentUser = response.data;
          const token = response.meta?.accessToken;
          if (token) localStorage.setItem('accessToken', token);
          if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            handleSetCurrentUser(currentUser);
          }
          navigate('/');
        }, 500);
      })
      .catch((error) => {
        setError(true);
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {contextHolder}
      <div className={cx('wrapper')}>
        <form className={cx('form')} onSubmit={handleLoginSubmit}>
          <Flex vertical gap={24}>
            <h2>Login</h2>
            <Space direction="vertical">
              <label htmlFor="">Email: </label>
              <Input
                size="large"
                placeholder="Enter Your Email"
                prefix={<FiUser />}
                name="email"
                value={inputValues.email}
                onChange={handleInputChange}
                status={error ? 'error' : ''}
              />
            </Space>

            <Space direction="vertical">
              <label htmlFor="">Password: </label>
              <Input.Password
                name="password"
                size="large"
                placeholder="Enter Your Password"
                value={inputValues.password}
                onChange={handleInputChange}
                prefix={<MdOutlineAttachEmail />}
                status={error ? 'error' : ''}
              />
            </Space>

            {error && <p className={cx('error-message')}>Email or Password is incorrect!</p>}
            <p>
              Don't have account. Please <Link to={'/auth/register'}>Register</Link>
            </p>

            <Button
              type="primary"
              size="large"
              htmlType="submit"
              disabled={Object.values(inputValues).some((value) => !value.trim())}
              loading={isLoading}
            >
              Login
            </Button>
          </Flex>
        </form>
      </div>
    </>
  );
};

export default Login;
