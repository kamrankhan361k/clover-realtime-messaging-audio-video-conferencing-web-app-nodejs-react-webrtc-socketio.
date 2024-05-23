import axios from 'axios';
import Config from '../config';

const search = (text, limit) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/search`,
    data: { limit: limit || 30, search: text || '' },
  });
};

export default search;
