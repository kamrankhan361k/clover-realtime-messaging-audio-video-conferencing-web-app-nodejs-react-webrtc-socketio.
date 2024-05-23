import { useState } from 'react';
import './Room.sass';
import { FiMessageSquare } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGlobal } from 'reactn';
import Picture from '../../../components/Picture';
import createRoom from '../../../actions/createRoom';
import Actions from '../../../constants/Actions';

function Room({ user }) {
  const [hover, setHover] = useState(false);
  const setNav = useGlobal('nav')[1];

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const title = `${user.firstName} ${user.lastName}`.substr(0, 22);

  const chat = async () => {
    const res = await createRoom(user._id);
    setNav('rooms');
    const target = `/room/${res.data.room._id}`;
    dispatch({ type: Actions.SET_ROOM, room: res.data.room });
    dispatch({ type: Actions.SET_MESSAGES, messages: res.data.room.messages });
    if (location.pathname !== target) navigate(target, { replace: true });
  };

  return (
    <div className="room uk-flex" onMouseOver={() => setHover(true)} onMouseOut={() => setHover(false)} onClick={chat}>
      <div className="profile">
        <Picture user={user} />
      </div>
      <div className="text">
        <div className="title">
          {title}
          {title.length > 22 && '...'}
        </div>
      </div>
      <div className="controls" hidden={hover}>
        <div className="date">
          @
          {user.username}
        </div>
      </div>
      <div className="controls" hidden={!hover}>
        <div className="button">
          <FiMessageSquare />
        </div>
      </div>
    </div>
  );
}

export default Room;
