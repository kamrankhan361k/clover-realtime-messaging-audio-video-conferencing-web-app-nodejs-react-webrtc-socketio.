import { useEffect, useState } from 'react';
import Div100vh from 'react-div-100vh';
import { Link, useNavigate } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import Credits from './components/Credits';
import Logo from './components/Logo';
import Input from './components/Input';
import './ForgotPassword.sass';
import Config from '../../config';
import sendCode from '../../actions/sendCode';
import changePassword from '../../actions/changePassword';
import backgroundImage from '../../assets/background.jpg';

function Login() {
  const { addToast } = useToasts();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [password, setPassword] = useState('');
  const [codeErrors, setCodeErrors] = useState({});
  const [changeErrors, setChangeErrors] = useState({});
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (window.self !== window.top) {
      addToast(
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.top.location.href = Config.url;
          }}
        >
          <b>Click here to remove the Envato frame or meetings will not work properly.</b>
        </a>,
        {
          appearance: 'warning',
          autoDismiss: false,
        },
      );
    }
  }, []);

  const onCode = async (e) => {
    e.preventDefault();
    try {
      await sendCode(email);
      setSent(true);
    } catch (e) {
      let errors = {};
      if (!e.response || typeof e.response.data !== 'object') errors.generic = 'Could not connect to server.';
      else errors = e.response.data;
      setCodeErrors(errors);
    }
  };

  const onChange = async (e) => {
    e.preventDefault();
    try {
      await changePassword(email, authCode, password);
      navigate('/login', { replace: true });
      setSent(false);
      addToast('Password changed! You may now sign in.', {
        appearance: 'success',
        autoDismiss: true,
      });
    } catch (e) {
      let errors = {};
      if (!e.response || typeof e.response.data !== 'object') errors.generic = 'Could not connect to server.';
      else errors = e.response.data;
      setChangeErrors(errors);
    }
  };

  const codeInfo = Object.keys(codeErrors)
    .filter((key) => codeErrors[key] !== 'error')
    .map((key) => (
      <div className="uk-text-center" key={key}>
        <span className="uk-text-danger">{codeErrors[key]}</span>
      </div>
    ));

  const changeInfo = Object.keys(changeErrors)
    .filter((key) => changeErrors[key] !== 'error')
    .map((key) => (
      <div className="uk-text-center" key={key}>
        <span className="uk-text-danger">{changeErrors[key]}</span>
      </div>
    ));

  const loginStyle = {
    backgroundImage: `url('${backgroundImage}')`,
  };

  return (
    <Div100vh>
      <div className="login uk-cover-container uk-background-secondary uk-flex uk-flex-center uk-flex-middle uk-overflow-hidden uk-light" style={loginStyle}>
        <div className="uk-position-cover uk-overlay-primary" />
        <div className="login-scrollable uk-flex uk-flex-center uk-flex-middle uk-position-z-index">
          <Credits />

          <div className="login-inner uk-width-medium uk-padding-small" data-uk-scrollspy="cls: uk-animation-fade">
            <Logo />

            <div className="toggle-credits">
              <form className="toggle-code" hidden={sent} onSubmit={onCode}>
                {codeInfo}
                <Input
                  icon="mail"
                  placeholder="Email"
                  type="text"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
                <div className="uk-margin-bottom">
                  <button type="submit" className="uk-button uk-button-primary uk-border-pill uk-width-1-1">
                    SEND CODE
                  </button>
                </div>
              </form>

              <form className="toggle-change" hidden={!sent} onSubmit={onChange}>
                {changeInfo}
                <Input
                  icon="lock"
                  placeholder="Auth Code"
                  type="text"
                  onChange={(e) => setAuthCode(e.target.value)}
                  value={authCode}
                />
                <Input
                  icon="lock"
                  placeholder="New Password"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
                <div className="uk-margin-bottom">
                  <button type="submit" className="uk-button uk-button-primary uk-border-pill uk-width-1-1">
                    CHANGE PASSWORD
                  </button>
                </div>
              </form>

              <div>
                <div className="uk-text-center">
                  <a className="uk-link-reset uk-text-small" href="#">
                    <Link to="/login">Back to Login</Link>
                  </a>
                </div>
              </div>
            </div>

            <form className="toggle-credits uk-text-center" hidden>
              <span>
                Everyone has a sweet side
                <br />
                Everything can taste like honey
                <br />
              </span>
              <br />
              Special thanks to all of the people who believed that Clover was possible and who made it possible.
              <br />
              <br />
              This Login / Register page uses
              {' '}
              <a href="https://github.com/zzseba78/Kick-Off" target="_blank" rel="noopener noreferrer">
                Kick-Off
              </a>
              {' '}
              by zzseba78
              <br />
              <br />
              The default background image is from
              {' '}
              <a href="https://picsum.photos/" target="_blank" rel="noopener noreferrer">
                Picsum Photos
              </a>
              <br />
              <br />
              A big thank you to all contributors to React, Redux, Socket.IO, Emoji Mart, Axios, SASS and Moment
            </form>

            <div>
              <div className="uk-margin-top uk-text-center">
                <a
                  className="uk-link-reset uk-text-small toggle-credits"
                  data-uk-toggle="target: .toggle-credits ;animation: uk-animation-fade"
                  hidden
                >
                  <span data-uk-icon="arrow-left" />
                  {' '}
                  Close Credits
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Div100vh>
  );
}

export default Login;
