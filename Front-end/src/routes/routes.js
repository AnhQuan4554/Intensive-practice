import Dashboard from '@/pages/Dashboard';
import SensorsHistory from '@/pages/SensorsHistory';
import ActionHistory from '@/pages/ActionHistory';
import Profile from '@/pages/Profile';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

export const publicRoutes = [
  {
    path: '/',
    component: Dashboard,
  },
  {
    path: '/history/sensors',
    component: SensorsHistory,
  },
  {
    path: '/history/actions',
    component: ActionHistory,
  },
  {
    path: '/profile',
    component: Profile,
  },
  {
    path: '/auth/login',
    component: Login,
  },
  {
    path: '/auth/register',
    component: Register,
  },
];

export const privateRoutes = [];

// export default { publicRoutes, privateRoutes };
