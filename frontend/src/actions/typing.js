import axios from 'axios';
import Config from '../config';

const typing = (room, isTyping) => () => {
  axios
    .post(`${Config.url || ''}/api/typing`, { room, isTyping })
    .then(() => {})
    .catch((err) => {
      console.log(err);
    });
};

export default typing;
