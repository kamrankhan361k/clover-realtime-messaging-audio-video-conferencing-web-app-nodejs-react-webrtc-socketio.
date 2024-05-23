import { useState } from 'react';
import './Popup.sass';
import { FiX } from 'react-icons/fi';
import { useToasts } from 'react-toast-notifications';
import changeUserPassword from '../../../actions/changeUserPassword';

function Input({
  icon, placeholder, type, onChange, required, value,
}) {
  return (
    <div className="uk-margin-small-top">
      <div className="uk-inline uk-width-1-1">
        <span className="uk-form-icon uk-form-icon-flip" data-uk-icon={`icon: ${icon}`} onChange={onChange} />
        <input
          className="uk-input uk-margin-remove"
          required={required}
          placeholder={placeholder}
          value={value}
          type={type}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function AddPeers({ onClose }) {
  const { addToast } = useToasts();

  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [errors, setErrors] = useState(null);

  const onChangePassword = async (e) => {
    e.preventDefault();

    if (password !== repeatPassword) {
      return setErrors({
        repeatPassword: 'repeat must be same as password',
      });
    }

    try {
      await changeUserPassword(password);
      onClose();
      addToast('Password changed!', {
        appearance: 'success',
        autoDismiss: true,
      });
    } catch (e) {
      let errors = {};
      if (!e.response || typeof e.response.data !== 'object') errors.generic = 'Could not connect to server.';
      else errors = e.response.data;
      setErrors(errors);
    }
  };

  return (
    <div className="admin-overlay">
      <div className="box">
        <div className="top-controls">
          <div className="title">Change user password</div>
          <div className="close" onClick={onClose}>
            <FiX />
          </div>
        </div>

        <div className="data-editor">
          <div className="uk-flex uk-flex-column uk-flex-center uk-flex-middle admin-delete">
            <form className="uk-flex uk-flex-column uk-flex-center uk-flex-middle" onSubmit={onChangePassword}>
              <Input
                icon="lock"
                placeholder="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors && errors.password && <div className="admin-form-error">{errors.password}</div>}
              <Input
                icon="lock"
                placeholder="Repeat Password"
                type="password"
                value={repeatPassword}
                required
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
              {errors && errors.repeatPassword && <div className="admin-form-error">{errors.repeatPassword}</div>}
              <button type="submit" style={{ marginBottom: 4 }} className="uk-button uk-button-honey uk-margin-top">
                Change Password
              </button>
              <button className="uk-button uk-button-secondary" onClick={onClose}>
                Cancel
              </button>
            </form>
            <div className="padding" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPeers;
