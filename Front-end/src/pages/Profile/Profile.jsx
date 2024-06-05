import { useState } from 'react';
import classNames from 'classnames/bind';

import { FaRegUser } from 'react-icons/fa';

import styles from './Profile.module.scss';
import AccountInfo from './components/AccountInfo';
import { Tabs } from 'antd';

const cx = classNames.bind(styles);

function Profile() {
  const items = [
    {
      key: '1',
      label: 'Account Info',
      children: <AccountInfo />,
      icon: <FaRegUser />,
    },
  ];

  return (
    <div className={cx('profile-wrapper')}>
      <Tabs className={cx('tab-container')} defaultActiveKey="1" size="large" tabPosition="left" items={items} />
    </div>
  );
}

export default Profile;
