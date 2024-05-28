import { Fragment, useContext } from 'react';
import { Route, Routes } from 'react-router-dom';
import { DefaultLayout } from '@/layouts';
import { publicRoutes } from '@/routes';
import HistoryRouter from '@/components/HistoryRouter';
import { myHistory } from '@/utils/history';

import '@/assets/styles/App.scss';
import { AuthContext } from '@/contexts/AuthContext';

function App() {
  const { currentUser, isLoading } = useContext(AuthContext);
  if (!currentUser && !isLoading) myHistory.replace('/auth/login');

  return (
    // <BrowserRouter>
    <HistoryRouter history={myHistory}>
      <div className="App">
        <Routes>
          {publicRoutes.map((route, index) => {
            let Layout = DefaultLayout;
            if (route.layout) {
              Layout = route.layout;
            } else if (route.layout === null) {
              Layout = Fragment;
            }

            const Page = route.component;

            return (
              <Route
                key={index}
                path={route.path}
                element={
                  <Layout>
                    <Page />
                  </Layout>
                }
              />
            );
          })}
        </Routes>
      </div>
    </HistoryRouter>
    // </BrowserRouter>
  );
}

export default App;
