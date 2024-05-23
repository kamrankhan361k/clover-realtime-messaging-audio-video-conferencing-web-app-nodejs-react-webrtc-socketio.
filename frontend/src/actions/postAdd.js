import axios from 'axios';
import Config from '../config';

const postAdd = ({ userID, meetingID }) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/meeting/add`,
    data: { userID, meetingID },
  });
};

export default postAdd;
