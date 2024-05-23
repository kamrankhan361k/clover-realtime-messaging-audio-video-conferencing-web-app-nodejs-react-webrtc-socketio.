// Adds support for Promise to socket.io-client
// eslint-disable-next-line func-names
export default function (socket) {
  return function request(type, data = {}) {
    return new Promise((resolve) => {
      socket.emit(type, data, resolve);
    });
  };
};
