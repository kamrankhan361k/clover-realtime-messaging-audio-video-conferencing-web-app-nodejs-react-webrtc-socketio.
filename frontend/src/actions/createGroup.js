import axios from 'axios';
import Config from '../config';

const createGroup = (data) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/group/create`,
    data,
  });
};

export default createGroup;
