import axios from 'axios';
import Config from '../config';

const changePicture = (imageID) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/picture/change`,
    data: { imageID },
  });
};

export default changePicture;
