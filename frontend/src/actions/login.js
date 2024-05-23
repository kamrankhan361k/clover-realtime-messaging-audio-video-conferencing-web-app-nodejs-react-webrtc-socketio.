import axios from 'axios';
import Config from '../config';

const login = (email, password) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/login`,
    data: { email, password },
  });
};

export default login;
