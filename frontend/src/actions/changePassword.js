import axios from 'axios';
import Config from '../config';

const changePassword = (email, authCode, password) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/auth/change`,
    data: { email, code: authCode, password },
  });
};

export default changePassword;
