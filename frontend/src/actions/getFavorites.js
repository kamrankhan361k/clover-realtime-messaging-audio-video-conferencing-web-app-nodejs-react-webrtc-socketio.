import axios from 'axios';
import Config from '../config';

const getFavorites = () => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/favorites/list`,
    data: {},
  });
};

export default getFavorites;
