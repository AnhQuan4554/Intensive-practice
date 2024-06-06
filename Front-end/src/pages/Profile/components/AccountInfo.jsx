import React, { useContext, useEffect, useState } from 'react';
import classNames from 'classnames/bind';

import styles from '../Profile.module.scss';
import { FiUser } from 'react-icons/fi';
import { Avatar, Button, Flex, Input, Space, Switch, message } from 'antd';
import { AuthContext } from '@/contexts/AuthContext';
import userServices from '@/services/userServices';

const cx = classNames.bind(styles);

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
};

const AccountInfo = () => {
  const { currentUser, handleSetCurrentUser } = useContext(AuthContext);
  const [messageApi, contextHolder] = message.useMessage();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorList, setErrorList] = useState({
    email: '',
  });
  const [formValues, setFormValues] = useState({
    name: currentUser?.name ?? '',
    phone: currentUser?.phone ?? '',
    email: currentUser?.email ?? '',
    allowNotify: +currentUser?.allowNotify ?? 0,
    contactId: currentUser?.contactId ?? '',
    createdAt: currentUser?.createdAt ?? '',
  });

  const handleChangeValue = (e) => {
    setErrorList({});
    const { name, value } = e?.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: checked ? 1 : 0,
    }));
  };

  useEffect(() => {
    if (currentUser) {
      setFormValues({
        name: currentUser.name,
        phone: currentUser.phone,
        email: currentUser.email,
        contactId: currentUser.contactId,
        allowNotify: +currentUser.allowNotify,
        createdAt: currentUser.createdAt,
      });
    }
  }, [currentUser]);

  const handleCancelEditing = () => {
    handleSetCurrentUser({ ...currentUser });
    setErrorList({});
    setIsEditing(false);
  };

  function isValidForm(data) {
    if (!validateEmail(data.email)) {
      setErrorList((prev) => ({ ...prev, email: 'Invalid Email' }));
      return false;
    }

    return true;
  }

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const formData = Object.fromEntries(
      Object.entries(formValues).map(([key, value]) => {
        if (typeof value === 'string') return [key, value.trim()];
        return [key, value];
      }),
    );
    if (!isValidForm(formData)) return;

    setIsLoading(true);
    userServices
      .updateUser(formData)
      .then((response) => {
        messageApi.success(response.message);
        setTimeout(() => {
          const currentUser = response.data;
          if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            handleSetCurrentUser(currentUser);
            setIsEditing(false);
          }
        }, 500);
      })
      .catch((error) => {
        messageApi.success('Update failed');
        if (error.response.status === 409) {
          setErrorList((prev) => ({
            ...prev,
            email: 'Email is already used',
          }));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {contextHolder}
      <div className={cx('account-info-wrapper')}>
        <Avatar className={cx('account-avatar')} size={64} icon={<FiUser />} />

        <form onSubmit={handleFormSubmit}>
          <Flex vertical gap={24} className={cx('account-info')}>
            <Space className={cx('input-wrapper')} size={12}>
              <label className={cx('input-label')} htmlFor="">
                Name:
              </label>
              <Input
                className={cx('input-control')}
                size="large"
                variant="filled"
                value={formValues.name}
                name="name"
                onChange={handleChangeValue}
                disabled={!isEditing}
              />
            </Space>

            <Space className={cx('input-wrapper')} size={12}>
              <label className={cx('input-label')} htmlFor="">
                Phone:
              </label>
              <Input
                className={cx('input-control')}
                size="large"
                variant="filled"
                value={formValues.phone}
                name="phone"
                onChange={handleChangeValue}
                disabled={!isEditing}
              />
            </Space>

            <Space className={cx('input-wrapper')} size={12}>
              <label className={cx('input-label')} htmlFor="">
                Email:
              </label>
              <Input
                className={cx('input-control')}
                size="large"
                variant="filled"
                value={formValues.email}
                name="email"
                onChange={handleChangeValue}
                disabled={!isEditing}
                status={errorList.email ? 'error' : ''}
              />
              {errorList.email && <p className={cx('error-message')}>{errorList.email}</p>}
            </Space>

            <Space className={cx('input-wrapper')} size={12}>
              <label className={cx('input-label')} htmlFor="">
                Created At:
              </label>
              <Input
                className={cx('input-control')}
                size="large"
                variant="borderless"
                value={formValues.createdAt}
                disabled
              />
            </Space>

            <Space className={cx('input-wrapper')} size={12}>
              <label className={cx('input-label')} htmlFor="">
                Contact Id:
              </label>
              <Input
                className={cx('input-control')}
                size="large"
                variant="borderless"
                value={formValues.contactId}
                disabled
              />
            </Space>

            <Space className={cx('input-wrapper')} size={12}>
              <label className={cx('input-label')} htmlFor="">
                Allow Notify:
              </label>
              <Switch
                name="allowNotify"
                checkedChildren="YES"
                unCheckedChildren="NO"
                defaultChecked={+formValues.allowNotify === 1 ? true : false}
                onChange={(checked) => handleSwitchChange('allowNotify', checked)}
                disabled={!isEditing}
              />
            </Space>

            {isEditing ? (
              <Space size="large">
                <Button size="large" onClick={handleCancelEditing}>
                  Cancel
                </Button>
                <Button
                  loading={isLoading}
                  type="primary"
                  size="large"
                  htmlType="submit"
                  disabled={Object.values(formValues).some((value) => typeof value === 'string' && !value?.trim())}
                >
                  Save
                </Button>
              </Space>
            ) : (
              <Space size="large">
                <Button size="large" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              </Space>
            )}
          </Flex>
        </form>
      </div>
    </>
  );
};

export default AccountInfo;
