import React, { useContext, useState } from 'react';
import classNames from 'classnames/bind';

import { Button, Flex, Input, Space, message } from 'antd';
import { FiUser } from 'react-icons/fi';
import { RiLockPasswordLine } from 'react-icons/ri';
import { MdOutlineAttachEmail } from 'react-icons/md';
import { FaPhoneAlt } from 'react-icons/fa';

import styles from './Register.module.scss';
import authServices from '@/services/authServices';
import { AuthContext } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
};

const Register = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [isLoading, setIsLoading] = useState(false);
  const { handleSetCurrentUser } = useContext(AuthContext);
  const [error, setError] = useState({});
  const [inputValues, setInputValues] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (error) setError(false);
    setInputValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function isValidForm(formData) {
    if (!validateEmail(formData.email)) {
      setError((prev) => ({
        ...prev,
        email: 'Email is invalid',
      }));
      return false;
    } else {
      const { email, ...others } = error;
      setError(others);
    }

    if (formData.password.length < 6) {
      setError((prev) => ({
        ...prev,
        password: 'Password must be least 6 characters',
      }));
      return false;
    } else {
      const { password, ...others } = error;
      setError(others);
    }

    if (formData.password !== formData.confirmPassword) {
      setError((prev) => ({
        ...prev,
        password: 'Password is not matching',
        confirmPassword: 'Password is not matching',
      }));
      return false;
    } else {
      const { password, confirmPassword, ...others } = error;
      setError(others);
    }

    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formValues = Object.fromEntries(
      Object.entries(inputValues).map(([key, value]) => {
        return [key, value.trim()];
      }),
    );

    const formData = {
      name: formValues.name,
      email: formValues.email,
      phone: formValues.phone,
      password: formValues.password,
      confirmPassword: formValues.confirmPassword,
    };

    if (!isValidForm(formData)) return;

    setIsLoading(true);
    authServices
      .registerUser(formData)
      .then((response) => {
        messageApi.success(response.message);
        setTimeout(() => {
          navigate('/auth/login');
        }, 500);
      })
      .catch((error) => {
        const message = error?.data?.message;
        console.log('Failed to register', error);
        if (error?.status === 409) messageApi.error(error?.data?.message);
        setError((prev) => ({
          ...prev,
          email: message || 'Something went wrong.',
        }));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {contextHolder}
      <div className={cx('wrapper')}>
        <form className={cx('form')} onSubmit={handleSubmit}>
          <Flex vertical gap={24}>
            <h2>Register</h2>

            <Space direction="vertical">
              <label htmlFor="">Your Name: </label>
              <Input
                name="name"
                size="large"
                placeholder="Enter Your Name"
                prefix={<FiUser />}
                value={inputValues.name}
                onChange={handleInputChange}
                // status={error}
              />
            </Space>

            <Space direction="vertical">
              <label htmlFor="">Email: </label>
              <Input
                name="email"
                size="large"
                placeholder="Enter Your Email"
                prefix={<MdOutlineAttachEmail />}
                value={inputValues.email}
                onChange={handleInputChange}
                status={error.email ? 'error' : ''}
              />
              {error.email && <p className={cx('error-message')}>{error.email}</p>}
            </Space>

            <Space direction="vertical">
              <label htmlFor="">Phone Number: </label>
              <Input
                name="phone"
                size="large"
                placeholder="Enter Your Phone Number"
                prefix={<FaPhoneAlt />}
                value={inputValues.phone}
                onChange={handleInputChange}
                // status={error ? 'error' : ''}
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
                prefix={<RiLockPasswordLine />}
                status={error.password ? 'error' : ''}
              />
              {error.password && <p className={cx('error-message')}>{error.password}</p>}
            </Space>

            <Space direction="vertical">
              <label htmlFor="">Confirm Password: </label>
              <Input.Password
                name="confirmPassword"
                size="large"
                placeholder="Confirm Your Password"
                value={inputValues.confirmPassword}
                onChange={handleInputChange}
                prefix={<RiLockPasswordLine />}
                status={error.confirmPassword ? 'error' : ''}
              />
              {error.confirmPassword && <p className={cx('error-message')}>{error.confirmPassword}</p>}
            </Space>

            {/* {error && <p className={cx('error-message')}>Email or Password is incorrect!</p>} */}
            <p>
              Already have an account. Let <Link to={'/auth/login'}>Login</Link>
            </p>

            <Button
              type="primary"
              size="large"
              htmlType="submit"
              disabled={Object.values(inputValues).some((value) => !value.trim())}
              loading={isLoading}
            >
              Register
            </Button>
          </Flex>
        </form>
      </div>
    </>
  );
};

export default Register;
