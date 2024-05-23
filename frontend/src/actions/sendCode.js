import axios from 'axios';
import Config from '../config';

const sendCode = (email) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/auth/code`,
    data: { email },
  });
};

export default sendCode;
