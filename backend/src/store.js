module.exports = {
  app: null,
  config: {},
  connected: false,
  io: null,
  sockets: {},
  socketIds: [],
  socketsByUserID: {},
  userIDsBySocketID: {},
  onlineUsers: null,
  rtcRooms: {},
  rooms: {},
  peers: {},
  consumerUserIDs: {},
  roomIDs: {},
};

/*
RTC room template
{
    id: '', // ID of the room
    peers: [], // Connected users
    exit: [], // Users who rejected or left the call
    ring: [], // Users that did not answer
}
These are arrays of user objects.
If everyone left, destroy the room.
If no one is in the call and a timeout is reached, destroy the room and notify ringing users.
 */
