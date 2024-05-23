import IO from 'socket.io-client';
import { setGlobal } from 'reactn';
import Config from '../config';
import Actions from '../constants/Actions';
import store from '../store';
import getRooms from './getRooms';
import messageSound from '../assets/message.mp3';
import socketPromise from '../lib/socket.io-promise';

const initIO = (token) => (dispatch) => {
  const io = IO(`${Config.url || ''}/`);
  io.request = socketPromise(io);

  io.on('connect', () => {
    io.emit('authenticate', { token });
    console.log('IO connected');
  });

  io.on('authenticated', () => {
    console.log('IO authenticated');
    dispatch({ type: Actions.IO_INIT, io });
  });

  io.on('message-in', (data) => {
    const { room, message } = data;

    const currentRoom = store.getState().io.room;

    const audio = document.createElement('audio');
    audio.style.display = 'none';
    audio.src = messageSound;
    audio.autoplay = true;
    audio.onended = () => audio.remove();
    document.body.appendChild(audio);

    if (!currentRoom || currentRoom._id !== room._id) {
      store.dispatch({ type: Actions.MESSAGES_ADD_ROOM_UNREAD, roomID: room._id });
    }

    if (!currentRoom) return;
    if (currentRoom._id === room._id) store.dispatch({ type: Actions.MESSAGE, message });

    getRooms()
      .then((res) => store.dispatch({ type: Actions.SET_ROOMS, rooms: res.data.rooms }))
      .catch((err) => console.log(err));
  });

  io.on('newProducer', (data) => {
    console.log('newProducer', data);
    if (data.socketID !== io.id) store.dispatch({ type: Actions.RTC_PRODUCER, data });
  });

  io.on('leave', (data) => {
    console.log('leave', data);
    let { producers } = store.getState().rtc;
    producers = producers.filter((producer) => producer.socketID !== data.socketID);
    console.log('producers after leave', producers);
    store.dispatch({ type: Actions.RTC_RESET_PRODUCERS, producers, socketID: data.socketID });
  });

  io.on('consumers', (data) => {
    console.log('consumers', data);
    store.dispatch({ type: Actions.RTC_CONSUMERS, consumers: data });
  });

  io.on('newPeer', (data) => {
    console.log('newPeer', data);
    store.dispatch({ type: Actions.RTC_NEW_PEER, data });
  });

  io.on('call', (data) => {
    console.log('call', data);
    store.dispatch({ type: Actions.RTC_SET_COUNTERPART, counterpart: data.counterpart });
    store.dispatch({ type: Actions.RTC_CALL, data });
  });

  io.on('close', (data) => {
    console.log('close', data);
    store.dispatch({ type: Actions.RTC_CLOSE, data });
  });

  io.on('answer', (data) => {
    console.log('answer', data);
    store.dispatch({ type: Actions.RTC_ANSWER, data });
  });

  io.on('remove', (data) => {
    console.log('remove', data.producerID);
    let { producers } = store.getState().rtc;
    producers = producers.filter((producer) => producer.producerID !== data.producerID);
    console.log('producers after remove', producers);
    store.dispatch({
      type: Actions.RTC_RESET_PRODUCERS,
      producers,
      socketID: data.socketID,
      lastLeaveType: 'remove',
      producerID: data.producerID,
    });
  });

  io.on('onlineUsers', (data) => {
    store.dispatch({ type: Actions.ONLINE_USERS, data });
  });

  io.on('refresh-meetings', (data) => {
    store.dispatch({ type: Actions.REFRESH_MEETINGS, timestamp: data.timestamp });
  });

  io.on('user-deleted', async () => {
    localStorage.removeItem('token');
    await setGlobal({
      token: null,
      user: {},
    });
  });

  io.on('typing', (data) => {
    if (store.getState().io.room && data.roomID === store.getState().io.room._id) {
      if (data.isTyping) {
        clearTimeout(window.typingTimeout);
        window.typingTimeout = setTimeout(() => {
          dispatch({ type: Actions.SET_TYPING, typing: false });
        }, 10000);
      } else {
        clearTimeout(window.typingTimeout);
      }
      dispatch({ type: Actions.SET_TYPING, typing: data.isTyping });
    }
  });

  io.on('disconnected', () => {});

  window.onbeforeunload = () => {
    io.emit('leave', { socketID: io.id, roomID: store.getState().rtc.roomID });
  };
};

export default initIO;
