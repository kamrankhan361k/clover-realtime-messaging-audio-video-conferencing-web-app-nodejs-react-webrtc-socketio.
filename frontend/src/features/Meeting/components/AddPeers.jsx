import { useRef, useState } from 'react';
import './AddPeers.sass';
import { FiX, FiSearch } from 'react-icons/fi';
import { useGlobal } from 'reactn';
import { useParams } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import search from '../../../actions/search';
import User from './User';
import postAdd from '../../../actions/postAdd';

function AddPeers({ onClose }) {
  const searchInput = useRef();
  const [searchResults, setSearchResults] = useGlobal('searchResults');
  const [searchText, setSearch] = useGlobal('search');
  const [selected, setSelected] = useState([]);

  const { addToast } = useToasts();
  const params = useParams();
  const roomID = params.id;

  const onChange = (e) => {
    setSearch(e.target.value);
    search(e.target.value)
      .then((res) => setSearchResults(res.data.users))
      .catch((err) => console.log(err));
  };

  const errorToast = (content) => {
    addToast(content, {
      appearance: 'error',
      autoDismiss: true,
    });
  };

  const call = async (user) => {
    setSelected([...selected, user._id]);
    console.warn(roomID);
    try {
      await postAdd({ userID: user._id, meetingID: roomID });
    } catch (e) {
      errorToast('Server error. Unable to initiate call.');
    }
  };

  const searchResultsList = searchResults.map((user) => (
    <User
      key={user._id}
      user={user}
      onSelect={() => !selected.includes(user._id) && call(user)}
      selected={selected.includes(user._id)}
    />
  ));

  function Notice({ text }) {
    return <div className="notice">{text}</div>;
  }

  return (
    <div className="add-peers-overlay">
      <div className="box">
        <div className="top-controls">
          <div className="title">Add Peers</div>
          <div className="close" onClick={onClose}>
            <FiX />
          </div>
        </div>
        <div className="search-bar uk-flex uk-flex-center uk-flex-middle">
          <div className="icon" onClick={() => searchInput.current.focus()}>
            <FiSearch />
          </div>
          <div className="uk-inline search">
            <input className="uk-input uk-border-pill" placeholder="Search" ref={searchInput} onChange={onChange} />
          </div>
        </div>
        <div className="users">
          {searchResultsList}
          {searchResults.length === 0 && <Notice text={`There are no search results for "${searchText}"`} />}
        </div>
      </div>
    </div>
  );
}

export default AddPeers;
