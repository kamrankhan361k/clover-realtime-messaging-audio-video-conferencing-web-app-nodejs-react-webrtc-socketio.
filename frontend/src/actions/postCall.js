import axios from 'axios';
import Config from '../config';

const postCall = ({ roomID, meetingID }) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/meeting/call`,
    data: { roomID, meetingID },
  });
};

export default postCall;
