import axios from 'axios';
import Config from '../config';

const postAnswer = ({ userID, meetingID, answer }) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/meeting/answer`,
    data: { userID, meetingID, answer },
  });
};

export default postAnswer;
