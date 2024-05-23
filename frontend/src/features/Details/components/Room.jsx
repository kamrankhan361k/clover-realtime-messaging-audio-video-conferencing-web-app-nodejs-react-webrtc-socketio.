import { useState, useEffect, useRef } from 'react';
import './Room.sass';
import { FiCircle } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { useGlobal } from 'reactn';
import { Lightbox } from 'react-modal-image';
import Config from '../../../config';

function Room() {
  const room = useSelector((state) => state.io.room);
  const onlineUsers = useSelector((state) => state.io.onlineUsers);
  const imagesNumber = useSelector((state) => state.io.room.images.length);
  const user = useGlobal('user')[0];

  const scrollContainer = useRef(null);

  const [scrollHeight, setScrollHeight] = useState(0);
  const [open, setOpen] = useState(null);
  const [viewMembers, setViewMembers] = useState(false);

  useEffect(() => {
    if (scrollContainer.current.scrollTop === 0) scrollContainer.current.scrollTop = scrollHeight;
  }, [imagesNumber]);

  let other = {
    firstName: 'A',
    lastName: 'A',
  };

  if (!room.isGroup && room.people) {
    room.people.forEach((person) => {
      if (person._id !== user.id) other = person;
    });
  }

  function Picture({ picture, user, group }) {
    if (picture) return <img src={`${Config.url || ''}/api/images/${picture.shieldedID}/256`} alt="Picture" />;
    return (
      <div className="img">
        {group ? room.title.substr(0, 1) : `${user.firstName.substr(0, 1)}${user.lastName.substr(0, 1)}`}
      </div>
    );
  }

  const rows = [];
  // eslint-disable-next-line no-unused-vars
  let rowIndex = 0;
  let row = [];

  room.images.forEach((message) => {
    row.push(message);
    if (row.length === 2) {
      rows.push(row);
      rowIndex++;
      row = [];
    }
  });
  if (row.length > 0) rows.push(row);

  const images = rows.map((row, key) => {
    const images = row.map((message) => {
      return (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <img
          src={`${Config.url || ''}/api/images/${message.content}/256`}
          alt={`Sent by @${message.author.username}`}
          onClick={() => setOpen(message)}
          key={message.content}
        />
      );
    });
    return <div className="row" key={key}>{images}</div>;
  });

  const onScroll = () => {
    setScrollHeight(scrollContainer.current.scrollHeight);
    if (
      scrollContainer.current.scrollTop
      >= scrollContainer.current.scrollHeight - scrollContainer.current.offsetHeight
    ) {
      // Request more images
    }
  };

  function Notice() {
    if (images.length === 0) {
      return <div className="notice-text">There are no images in this conversation yet.</div>;
    }
    return null;
  }

  const compare = (a, b) => {
    if (a.firstName < b.firstName) return -1;
    if (a.firstName > b.firstName) return 1;
    if (a.lastName < b.lastName) return -1;
    if (a.lastName > b.lastName) return 1;
    return 0;
  };

  const { people } = room;

  people.sort(compare);

  const getColor = (id) => {
    if (onlineUsers.filter((u) => u.id === id && u.status === 'busy').length > 0) return 'busy';
    if (onlineUsers.filter((u) => u.id === id && u.status === 'online').length > 0) return 'online';
    if (onlineUsers.filter((u) => u.id === id && u.status === 'away').length > 0) return 'away';
    return 'offline';
  };

  const members = people.map((person, key) => (
    <div className="member" key={key}>
      <Picture picture={person.picture} user={person} />
      <div className="text">
        {person.firstName}
        {' '}
        {person.lastName}
      </div>
      <div className={getColor(person._id)}>
        <FiCircle />
      </div>
    </div>
  ));

  function Members() {
    return <div className="members">{members}</div>;
  }

  return (
    <div className="details-room">
      <div className="profile">
        <Picture group={room.isGroup} picture={room.isGroup ? room.picture : other.picture} user={other} />
      </div>
      <div className="name" hidden>
        {room.isGroup ? room.title : `${other.firstName} ${other.lastName}`}
      </div>
      <div className="title" hidden>
        {other.tagLine || 'No Tag Line'}
      </div>
      <button
        className="details-button uk-margin-remove-bottom uk-button uk-button-secondary"
        onClick={() => setViewMembers(!viewMembers)}
      >
        View
        {viewMembers ? 'Images' : 'Members'}
      </button>
      {viewMembers && <Members />}
      <div className="images" ref={scrollContainer} onScroll={onScroll} hidden={viewMembers}>
        {open && (
          <Lightbox
            medium={`${Config.url || ''}/api/images/${open.content}/1024`}
            large={`${Config.url || ''}/api/images/${open.content}/2048`}
            alt="Lightbox"
            hideDownload
            onClose={() => setOpen(null)}
          />
        )}
        {images}
        <Notice />
      </div>
    </div>
  );
}

export default Room;
