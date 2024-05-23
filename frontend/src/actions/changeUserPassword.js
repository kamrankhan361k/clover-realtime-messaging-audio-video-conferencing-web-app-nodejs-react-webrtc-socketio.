import axios from 'axios';
import Config from '../config';

const changeUserPassword = (password) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/users/change-password`,
    data: { password },
  });
};

export default changeUserPassword;
