import { useEffect } from 'react';
import { getGlobal, useGlobal, setGlobal } from 'reactn';
import './App.sass';
import {
  BrowserRouter as Router, Routes, Route, Navigate,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import jwtDecode from 'jwt-decode';
import { useToasts } from 'react-toast-notifications';
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Config from './config';
import setAuthToken from './actions/setAuthToken';
import initIO from './actions/initIO';

function App() {
  const dispatch = useDispatch();
  const { addToast } = useToasts();
  const io = useSelector((state) => state.io.io);

  const token = useGlobal('token')[0];
  const setStartingPoint = useGlobal('entryPath')[1];

  if (!['dark', 'light'].includes(Config.theme)) Config.theme = 'light';

  useEffect(() => {
    if (!io || !getGlobal().user || !token) return;
    let focusCount = 0;
    const interval = setInterval(() => {
      if (!document.hasFocus()) {
        focusCount++;
        if (focusCount === 10) {
          io.emit('status', { status: 'away' });
        }
      } else if (focusCount !== 0) {
        focusCount = 0;
        io.emit('status', { status: 'online' });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [io, token]);

  useEffect(() => {
    return () => {
      try {
        if (getGlobal().audioStream) {
          getGlobal()
            .audioStream.getTracks()
            .forEach((track) => track.stop());
        }
      } catch (e) {}
      try {
        if (getGlobal().videoStream) {
          getGlobal()
            .videoStream.getTracks()
            .forEach((track) => track.stop());
        }
      } catch (e) {}
    };
  }, []);

  if (!window.loaded) {
    setStartingPoint(window.location.pathname);
    const splitPath = window.location.pathname.split('/');
    const route = splitPath[1];
    const token = splitPath[2];
    if (route === 'login' && token && token.length > 20) {
      let decoded;
      try {
        decoded = jwtDecode(token);
        if (typeof decoded !== 'object' || typeof decoded.id !== 'string') return;
        setAuthToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(decoded));
        setGlobal({
          user: decoded,
          token,
        }).then(() => {
          dispatch(initIO(token));
        });
      } catch (e) {
        addToast('Invalid token provided in URL. You can still login manually.', {
          appearance: 'error',
          autoDismiss: true,
        });
      }
    }
    window.loaded = true;
  }

  return (
    <div className={`theme ${Config.theme}`}>
      <Router>
        <Routes>
          <Route path="/forgot-password" element={token ? <Navigate to="/" /> : <ForgotPassword />} />
          <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
          <Route path="/*" element={!token ? <Navigate to="/login" /> : <Home />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
