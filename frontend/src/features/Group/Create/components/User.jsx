import { useState } from 'react';
import './User.sass';
import { FiPlusCircle, FiMinusCircle } from 'react-icons/fi';
import Picture from '../../../../components/Picture';

function User({ user, selected, onSelect }) {
  const setHover = useState(false)[1];

  const title = `${user.firstName} ${user.lastName}`.substr(0, 22);

  return (
    <div
      className="room uk-flex"
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      onClick={onSelect}
    >
      <div className="profile">
        <Picture user={user} />
      </div>
      <div className="text">
        <div className="title">
          {title}
          {title.length > 22 && '...'}
        </div>
      </div>
      <div className="controls">
        <div className={`date${selected ? ' selected' : ''}`}>
          @
          {user.username}
        </div>
      </div>
      <div className="controls">
        <div className={`button${selected ? ' selected' : ''}`}>{selected ? <FiMinusCircle /> : <FiPlusCircle />}</div>
      </div>
    </div>
  );
}

export default User;
