import axios from 'axios';
import Config from '../config';

const getRoom = (id) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/room/join`,
    data: { id },
  });
};

export default getRoom;
