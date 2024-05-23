import axios from 'axios';
import Config from '../config';

const uploadFile = (file, token, onProgress = () => {}) => {
  const url = `${Config.url || ''}/api/upload/file`;

  const data = new FormData();

  data.append('file', file, file.name);

  const config = {
    onUploadProgress: onProgress,
  };

  return axios.post(url, data, config);
};

export default uploadFile;
