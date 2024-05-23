import axios from 'axios';
import Config from '../config';

const postClose = ({ meetingID, userID }) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/meeting/close`,
    data: { meetingID, userID },
  });
};

export default postClose;
