import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render } from '@testing-library/react';

const renderWithRouter = (component, routeConfigs = {}) => {
  const route = routeConfigs.route || '/';
  const history = routeConfigs.history || createMemoryHistory({ initialEntries: [route] });

  return {
    ...render(
    <Router
      navigator={ history }
      location={history.location}
    >
      {component}
    </Router>,
    ),
    history,
  };
};

// Referência ao TypeError: Cannot read property 'pathname' of undefined:
// https://stackoverflow.com/questions/69859509/cannot-read-properties-of-undefined-reading-pathname-when-testing-pages-in

export default renderWithRouter;
