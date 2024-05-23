import axios from 'axios';
import Config from '../config';

const register = (data) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/register`,
    data,
  });
};

export default register;
