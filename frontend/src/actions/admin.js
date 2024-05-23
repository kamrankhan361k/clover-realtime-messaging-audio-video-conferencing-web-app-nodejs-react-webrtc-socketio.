import axios from 'axios';
import Config from '../config';

export const postCreate = (data) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/register`,
    data,
  });
};

export const postUpdate = (data) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/user/edit`,
    data,
  });
};

export const postDelete = (data) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/user/delete`,
    data,
  });
};
