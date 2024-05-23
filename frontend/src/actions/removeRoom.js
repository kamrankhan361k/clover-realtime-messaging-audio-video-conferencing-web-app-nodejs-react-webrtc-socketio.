import axios from 'axios';
import Config from '../config';

const removeRoom = (id) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/room/remove`,
    data: { id },
  });
};

export default removeRoom;
