import { myHistory } from '@/utils/history';
import { createContext, useEffect, useState } from 'react';
import authAxios from '@/services/authAxios';

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const isLoggedInPrevious = localStorage.getItem('currentUser');
    if (isLoggedInPrevious) {
      authAxios
        .get('/auth/nothing')
        .then((response) => {
          const currentUser = response.data;
          console.log('currentUser', currentUser);
          if (currentUser) setCurrentUser(currentUser);
        })
        .catch((error) => {
          myHistory.replace('/auth/login');
          console.log(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      myHistory.replace('/auth/login');
    }
  }, []);

  const handleSetCurrentUser = (data) => {
    setCurrentUser(data);
  };

  const values = {
    isLoading,
    currentUser,
    handleSetCurrentUser,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
}
export { AuthContext, AuthProvider };
