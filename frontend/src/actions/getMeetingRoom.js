import axios from 'axios';
import Config from '../config';

const getMeetingRoom = (data) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/meeting/get`,
    data,
  });
};

export default getMeetingRoom;
