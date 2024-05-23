import axios from 'axios';
import Config from '../config';

const getMoreMessages = ({ roomID, firstMessageID }) => {
  return axios({
    method: 'post',
    url: `${Config.url || ''}/api/messages/more`,
    data: { roomID, firstMessageID },
  });
};

export default getMoreMessages;
