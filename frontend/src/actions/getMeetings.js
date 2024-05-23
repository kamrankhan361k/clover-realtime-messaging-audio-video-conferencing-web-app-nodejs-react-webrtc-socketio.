import axios from 'axios';
import Config from '../config';

const getMeetings = () => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/meeting/list`,
    data: {},
  });
};

export default getMeetings;
