import axios from 'axios';
import Config from '../config';

const message = (data) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/message`,
    data,
  });
};

export default message;
