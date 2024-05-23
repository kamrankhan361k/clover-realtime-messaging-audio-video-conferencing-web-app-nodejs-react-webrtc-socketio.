import axios from 'axios';
import Config from '../config';

const getInfo = () => {
  return axios({
    method: 'get',
    url: `${Config.url || ''}/api/info`,
  });
};

export default getInfo;
