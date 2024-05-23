import axios from 'axios';
import Config from '../config';

const toggleFavorite = (roomID) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/favorite/toggle`,
    data: { roomID },
  });
};

export default toggleFavorite;
