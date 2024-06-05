import { useEffect, useState } from 'react';
import { Router } from 'react-router-dom';
import PropTypes from 'prop-types';

HistoryRouter.propTypes = {
  basename: PropTypes.string,
  children: PropTypes.node.isRequired,
  history: PropTypes.any,
};

function HistoryRouter({ basename, children, history }) {
  let [state, setState] = useState({
    action: history.action,
    location: history.location,
  });

  useEffect(() => history.listen(setState), [history]);

  return (
    <Router basename={basename} location={state.location} navigationType={state.action} navigator={history}>
      {children}
    </Router>
  );
}

export default HistoryRouter;
