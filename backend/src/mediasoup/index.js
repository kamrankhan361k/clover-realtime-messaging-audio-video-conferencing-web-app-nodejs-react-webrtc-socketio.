const mediasoup = require('mediasoup');
config = require('../../config');
const store = require('../store');
const User = require('../models/User');
const Meeting = require('../models/Meeting');
const mongoose = require('mongoose');

let worker;
let mediasoupRouter;
let producerTransports = {};
let consumerTransports = {};
let producers = {};
let consumers = {};
let consumersObjects = {};

const init = async () => {
  worker = await mediasoup.createWorker({
    rtcMinPort: config.rtcMinPort,
    rtcMaxPort: config.rtcMaxPort,
    logLevel: config.mediasoupLogLevel,
  });

  worker.on('died', () => {
    console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
    setTimeout(() => process.exit(1), 2000);
  });

  const mediaCodecs = config.mediaCodecs;
  mediasoupRouter = await worker.createRouter({ mediaCodecs });
  console.log('mediasoup worker running'.green);
  console.log(`mediasoup ip is ${config.ipAddress.ip}`.green);
};

async function createWebRtcTransport() {
  const transport = await mediasoupRouter.createWebRtcTransport({
    listenInfos: [
      { protocol: 'tcp', ip: config.ipAddress.ip, announcedAddress: config.ipAddress.announcedIp },
      { protocol: 'udp', ip: config.ipAddress.ip, announcedAddress: config.ipAddress.announcedIp },
    ],
    initialAvailableOutgoingBitrate: 1000000,
  });
  try {
    await transport.setMaxIncomingBitrate(1500000);
  } catch (error) {}
  return {
    transport,
    params: {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    },
  };
}

async function createConsumer(producer, rtpCapabilities, consumerTransport) {
  if (
    !mediasoupRouter.canConsume({
      producerId: producer.id,
      rtpCapabilities,
    })
  ) {
    console.error('can not consume');
    return;
  }
  let consumer;
  try {
    consumer = await consumerTransport.consume({
      producerId: producer.id,
      rtpCapabilities,
      paused: producer.kind === 'video',
    });
  } catch (error) {
    console.error('consume failed', error);
    return;
  }

  if (consumer.type === 'simulcast') {
    await consumer.setPreferredLayers({ spatialLayer: 2, temporalLayer: 2 });
  }

  return {
    consumer,
    response: {
      producerId: producer.id,
      id: consumer.id,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
      type: consumer.type,
      producerPaused: consumer.producerPaused,
    },
  };
}

const initSocket = (socket) => {
  socket.on('getRouterRtpCapabilities', (data, callback) => {
    callback(mediasoupRouter.rtpCapabilities);
  });

  socket.on('createProducerTransport', async (data, callback) => {
    try {
      const { transport, params } = await createWebRtcTransport();
      producerTransports[socket.id] = transport;
      callback(params);
    } catch (err) {
      console.error(err);
      callback({ error: err.message });
    }
  });

  socket.on('createConsumerTransport', async (data, callback) => {
    try {
      const { transport, params } = await createWebRtcTransport();
      consumerTransports[socket.id] = transport;
      callback(params);
    } catch (err) {
      console.error(err);
      callback({ error: err.message });
    }
  });

  socket.on('connectProducerTransport', async (data, callback) => {
    await producerTransports[socket.id].connect({ dtlsParameters: data.dtlsParameters });
    callback();
  });

  socket.on('connectConsumerTransport', async (data, callback) => {
    await consumerTransports[socket.id].connect({ dtlsParameters: data.dtlsParameters });
    callback();
  });

  socket.on('produce', async (data, callback) => {
    const { kind, rtpParameters, isScreen } = data;
    let producer = await producerTransports[socket.id].produce({ kind, rtpParameters });

    producer.on('transportclose', () => {
      console.log("producer's transport closed", producer.id);
      closeProducer(producer, socket.id);
    });
    producer.observer.on('close', () => {
      console.log('producer closed', producer.id);
      closeProducer(producer, socket.id);
    });

    await store.peers.asyncInsert({
      type: 'producer',
      socketID: socket.id,
      userID: socket.decoded_token.id,
      roomID: data.roomID || 'general',
      producerID: producer.id,
      isScreen,
    });

    !producers[socket.id] && (producers[socket.id] = {});
    producers[socket.id][producer.id] = producer;

    socket
      .to(data.roomID)
      .emit('newProducer', {
        userID: socket.decoded_token.id,
        roomID: data.roomID || 'general',
        socketID: socket.id,
        producerID: producer.id,
        isScreen,
      });

    callback({ id: producer.id });
  });

  socket.on('consume', async (data, callback) => {
    const obj = await createConsumer(
      producers[data.socketID][data.producerID],
      data.rtpCapabilities,
      consumerTransports[socket.id],
    );

    obj.consumer.on('transportclose', () => {
      closeConsumer(obj.consumer, socket.id);
    });
    obj.consumer.on('producerclose', () => {
      closeConsumer(obj.consumer, socket.id);
    });

    !consumers[socket.id] && (consumers[socket.id] = {});
    consumers[socket.id][data.producerID] = obj.consumer;
    callback(obj.response);
  });

  socket.on('resume', async (data, callback) => {
    await consumers[socket.id][data.producerID].resume();
    callback();
  });

  socket.on('create', async (data, callback) => {
    const room = await store.rooms.asyncInsert({ lastJoin: Date.now() });
    callback(room);
  });

  socket.on('join', async (data, callback) => {
    const user = await User.findOne({ _id: socket.decoded_token.id }, { password: 0 }).populate([
      { path: 'picture', strictPopulate: false },
    ]);
    socket.to(data.roomID).emit('newPeer', { userID: socket.decoded_token.id, socketID: socket.id, user });
    consumersObjects[data.roomID] = {
      ...(consumersObjects[data.roomID] || {}),
      [socket.id]: { userID: socket.decoded_token.id, socketID: socket.id, user },
    };

    await socket.join(data.roomID || 'general');
    if (data.roomID) await store.rooms.asyncUpdate({ _id: data.roomID }, { $set: { lastJoin: Date.now() } });
    const peers = await store.peers.asyncFind({ type: 'producer', roomID: data.roomID || 'general' });

    if (!store.consumerUserIDs[data.roomID]) store.consumerUserIDs[data.roomID] = [];
    store.consumerUserIDs[data.roomID].push(socket.id);

    socket.to(data.roomID).emit('consumers', { content: store.consumerUserIDs[data.roomID], timestamp: Date.now() });

    await Meeting.findOneAndUpdate(
      { _id: data.roomID },
      {
        lastEnter: Date.now(),
        $push: { peers: socket.id },
        $addToSet: { users: mongoose.Types.ObjectId(socket.decoded_token.id) },
      },
    )
      .then((meeting) => {
        meeting.users.forEach((user) => {
          socket.to(user).emit('refresh-meetings', { timestamp: Date.now() });
        });
      })
      .catch((err) => console.log(err));

    store.roomIDs[socket.id] = data.roomID;

    store.onlineUsers.delete(socket);
    store.onlineUsers.set(socket, { id: socket.decoded_token.id, status: 'busy' });
    store.io.emit('onlineUsers', Array.from(store.onlineUsers.values()));

    callback({
      producers: peers,
      consumers: { content: store.consumerUserIDs[data.roomID], timestamp: Date.now() },
      peers: consumersObjects[data.roomID],
    });
  });

  socket.on('leave', async (data, callback) => {
    await socket.leave(data.roomID || 'general');
    await store.peers.asyncRemove({ socketID: socket.id }, { multi: true });
    store.io.to(data.roomID || 'general').emit('leave', { socketID: socket.id });
    if (producerTransports[socket.id]) producerTransports[socket.id].close();
    if (consumerTransports[socket.id]) consumerTransports[socket.id].close();

    store.roomIDs[socket.id] = null;

    await Meeting.findOneAndUpdate({ _id: data.roomID }, { lastLeave: Date.now(), $pull: { peers: socket.id } })
      .then((meeting) => {
        (meeting.users || []).forEach((user) => {
          socket.to(user).emit('refresh-meetings', { timestamp: Date.now() });
        });
      })
      .catch((err) => console.log(err));

    if (store.consumerUserIDs[data.roomID])
      store.consumerUserIDs[data.roomID].splice(store.consumerUserIDs[data.roomID].indexOf(socket.id), 1);
    socket.to(data.roomID).emit('consumers', { content: store.consumerUserIDs[data.roomID], timestamp: Date.now() });

    socket.to(data.roomID).emit('leave', { socketID: socket.id });

    store.onlineUsers.delete(socket);
    store.onlineUsers.set(socket, { id: socket.decoded_token.id, status: 'online' });
    store.io.emit('onlineUsers', Array.from(store.onlineUsers.values()));

    if (callback) callback();
  });

  socket.on('remove', async (data, callback) => {
    await store.peers.asyncRemove({ producerID: data.producerID }, { multi: true });
    store.io.to(data.roomID || 'general').emit('remove', { producerID: data.producerID, socketID: socket.id });
    callback();
  });
};

async function closeProducer(producer, socketID) {
  try {
    await producers[socketID][producer.id].close();
  } catch (e) {
    console.log(e);
  }
}

async function closeConsumer(consumer, socketID) {
  try {
    await consumers[socketID][consumer.id].close();
  } catch (e) {
    // console.log(e);
  }
}

module.exports = {
  init,
  initSocket,
};
