import { useContext, useRef, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { Helmet } from 'react-helmet';
import styles from './DefaultLayout.module.scss';
import Header from '@/layouts/components/Header';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '@/contexts/AuthContext';

const cx = classNames.bind(styles);

function DefaultLayout({ children }) {
  const { dark } = useContext(ThemeContext);
  const layoutRef = useRef(null);
  const { currentUser } = useContext(AuthContext);
  const location = useLocation().pathname;
  const [intercomScript, setIntercomScript] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { email } = currentUser;
        const response = await axios.get(`http://localhost:4004/api/user/script/${email}`);
        setIntercomScript(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    if (currentUser) fetchData();
  }, [currentUser]);

  return (
    <div
      className={cx('wrapper', {
        dark: dark,
      })}
    >
      <Header />
      <div
        ref={layoutRef}
        className={cx('container', {
          noHeight: location === '/profile',
        })}
      >
        {children}
        {intercomScript && (
          <Helmet>
            <script>
              {`
            ${intercomScript}
            `}
            </script>
          </Helmet>
        )}
      </div>
    </div>
  );
}

export default DefaultLayout;
