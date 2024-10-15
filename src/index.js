// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import store from './store/index';
import { Provider } from 'react-redux';
import './index.css'; // Import global CSS

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
