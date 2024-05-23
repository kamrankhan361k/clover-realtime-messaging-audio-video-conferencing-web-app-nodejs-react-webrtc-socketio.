import { useState } from 'react';
import './Room.sass';
import { useGlobal } from 'reactn';
import { FiPhone, FiMoreHorizontal } from 'react-icons/fi';
import moment from 'moment';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import { useDispatch, useSelector } from 'react-redux';
import getMeetingRoom from '../../../actions/getMeetingRoom';
import Picture from '../../../components/Picture';
import postCall from '../../../actions/postCall';
import Actions from '../../../constants/Actions';
import removeRoom from '../../../actions/removeRoom';
import getRooms from '../../../actions/getRooms';

function Room({ room }) {
  const roomsWithNewMessages = useSelector((state) => state.messages.roomsWithNewMessages);
  const onlineUsers = useSelector((state) => state.io.onlineUsers);
  const currentRoom = useSelector((state) => state.io.room);
  const [hover, setHover] = useState(false);
  const user = useGlobal('user')[0];
  const setAudio = useGlobal('audio')[1];
  const setVideo = useGlobal('video')[1];
  const setCallDirection = useGlobal('callDirection')[1];
  const setMeeting = useGlobal('meeting')[1];

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { addToast } = useToasts();

  let other = {};

  room.people.forEach((person) => {
    if (user.id !== person._id) other = person;
  });

  if (!other.firstName) {
    other = { ...other, firstName: 'Deleted', lastName: 'User' };
  }

  const title = (room.isGroup ? room.title : `${other.firstName} ${other.lastName}`).substr(0, 22);

  let { lastMessage } = room;
  let text = '';

  if (!lastMessage && room.isGroup) text = 'New group created.';
  if (!lastMessage && !room.isGroup) text = `No messages with ${other.firstName} yet.`;

  if (!lastMessage) lastMessage = {};

  if (lastMessage.author === user.id && !room.isGroup) text += 'You: ';

  switch (lastMessage.type) {
    case 'file':
      text += 'Sent a file.';
      break;
    case 'image':
      text += 'Sent a picture.';
      break;
    default:
      text += lastMessage.content || '';
  }

  const date = lastMessage ? moment(lastMessage.date).format('MMM D') : '';
  const time = lastMessage ? moment(lastMessage.date).format('h:mm A') : '';

  const popup = (content, type) => {
    addToast(content, {
      appearance: type,
      autoDismiss: true,
    });
  };

  const remove = async () => {
    if (
      window.confirm(
        'Are you sure you want to remove this room? All associated messages will be deleted, both for you and other members.',
      )
    ) {
      try {
        await removeRoom(room._id);
        popup('Room has been deleted.', 'success');
        getRooms()
          .then((res) => dispatch({ type: Actions.SET_ROOMS, rooms: res.data.rooms }))
          .catch((err) => console.log(err));
        if (currentRoom && room._id === currentRoom._id) navigate('/', { replace: true });
      } catch (e) {
        popup('Error while removing room. Please retry!', 'error');
      }
    }
  };

  const width = window.innerWidth;
  const isMobile = width < 700;

  const warningToast = (content) => {
    addToast(content, {
      appearance: 'warning',
      autoDismiss: true,
    });
  };

  const errorToast = (content) => {
    addToast(content, {
      appearance: 'error',
      autoDismiss: true,
    });
  };

  const call = async (callee, isVideo) => {
    if (onlineUsers.filter((u) => u.id === other._id).length === 0 && !room.isGroup) return warningToast("Can't call user because user is offline");
    await setAudio(true);
    await setVideo(isVideo);
    await setCallDirection('outgoing');
    dispatch({ type: Actions.RTC_SET_COUNTERPART, counterpart: callee });
    try {
      const res = await getMeetingRoom({
        startedAsCall: true,
        caller: user.id,
        callee: other._id,
        callToGroup: room.isGroup,
        group: room._id,
      });
      await setMeeting(res.data);
      navigate(`/meeting/${res.data._id}`, { replace: true });
      await postCall({ roomID: room._id, meetingID: res.data._id });
    } catch (e) {
      errorToast('Server error. Unable to initiate call.');
    }
  };

  const getStatus = () => {
    if (room.isGroup) return null;
    if (onlineUsers.filter((u) => u.id === other._id && u.status === 'busy').length > 0) return 'busy';
    if (onlineUsers.filter((u) => u.id === other._id && u.status === 'online').length > 0) return 'online';
    if (onlineUsers.filter((u) => u.id === other._id && u.status === 'away').length > 0) return 'away';
    return null;
  };

  return (
    <div
      className="room uk-flex"
      onMouseOver={!isMobile ? () => setHover(true) : undefined}
      onMouseOut={!isMobile ? () => setHover(false) : undefined}
      onClick={() => {
        const target = `/room/${room._id}`;
        if (location.pathname !== target) navigate(target, { replace: true });
      }}
    >
      <div className="uk-flex uk-flex-middle">
        <div className="profile">
          <Picture user={other} group={room.isGroup} picture={room.picture} title={room.title} />
        </div>
        {getStatus() && <div className={`dot ${getStatus()}`} />}
      </div>
      <div className="text">
        <div className={`title${roomsWithNewMessages.includes(room._id) ? ' highlight' : ''}`}>
          {title.substr(0, 20)}
          {title.length > 20 && '...'}
          {roomsWithNewMessages.includes(room._id)
            ? ` (${roomsWithNewMessages.filter((r) => room._id === r).length})`
            : ''}
        </div>
        <div className={`message${roomsWithNewMessages.includes(room._id) ? ' highlight' : ''}`}>
          {text.substr(0, 26)}
          {text.length > 26 && '...'}
        </div>
      </div>
      <div className="controls" hidden={hover}>
        <div className="date">
          {date}
          <br />
          {time}
        </div>
      </div>
      <div className="controls" hidden={!hover}>
        <div className="button" onClick={() => call(other, false)}>
          <FiPhone />
        </div>
        <div className="uk-inline">
          <div className="button" type="button">
            <FiMoreHorizontal />
          </div>
          <div data-uk-dropdown="mode: click; offset: 5; boundary: .top-bar">
            <div className="link" onClick={remove}>
              Remove
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Room;
