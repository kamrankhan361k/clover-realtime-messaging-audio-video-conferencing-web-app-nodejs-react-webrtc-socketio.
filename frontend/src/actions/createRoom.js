import axios from 'axios';
import Config from '../config';

const createRoom = (counterpart) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/room/create`,
    data: { counterpart },
  });
};

export default createRoom;
