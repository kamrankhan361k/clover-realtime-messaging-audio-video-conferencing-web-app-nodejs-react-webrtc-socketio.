import axios from 'axios';
import Config from '../config';

const removePicture = () => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/picture/remove`,
  });
};

export default removePicture;
