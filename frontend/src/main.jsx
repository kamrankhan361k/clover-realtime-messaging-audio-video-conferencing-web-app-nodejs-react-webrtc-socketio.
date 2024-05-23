import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import { Provider } from 'react-redux';
import { ToastProvider } from 'react-toast-notifications';
import App from './App';
import * as serviceWorker from './serviceWorker';
import init from './init';
import store from './store';

init().then(() => {
  // Loading UIkit Icons plugin.
  UIkit.use(Icons);

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <ToastProvider autoDismiss autoDismissTimeout={6000} placement="top-right">
          <App />
        </ToastProvider>
      </Provider>
    </React.StrictMode>,
  );

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://bit.ly/CRA-PWA
  serviceWorker.unregister();
});
