const store = require('../store');

module.exports = (socket, data) => {
  let { status } = data;
  if (store.onlineUsers.get(socket).status === 'busy') return;
  store.onlineUsers.delete(socket);
  store.onlineUsers.set(socket, { id: socket.decoded_token.id, status: status || 'online' });
  store.io.emit('onlineUsers', Array.from(store.onlineUsers.values()));
};
