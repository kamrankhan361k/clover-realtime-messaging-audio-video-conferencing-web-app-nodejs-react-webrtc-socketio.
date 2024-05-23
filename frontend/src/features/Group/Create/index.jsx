import { useEffect, useState } from 'react';
import { useGlobal } from 'reactn';
import './Create.sass';
import TopBar from './components/TopBar';
import SearchBar from './components/SearchBar';
import User from './components/User';
import search from '../../../actions/search';

function Panel() {
  const setPanel = useGlobal('panel')[1];
  const user = useGlobal('user')[0];
  const searchText = useGlobal('search')[0];
  const [newGroupUsers, setNewGroupUsers] = useGlobal('newGroupUsers');
  const [searchResults, setSearchResults] = useGlobal('searchResults');
  const [error, setError] = useState(false);

  useEffect(() => {
    search()
      .then((res) => setSearchResults(res.data.users))
      .catch((err) => console.log(err));
  }, [setSearchResults]);

  useEffect(() => {
    setNewGroupUsers([user.id]);
  }, [user]);

  const onSelect = (id) => {
    if (newGroupUsers.includes(id)) {
      setNewGroupUsers(newGroupUsers.filter((u) => u !== id));
    } else {
      setError(false);
      setNewGroupUsers([...newGroupUsers, id]);
    }
  };

  const searchResultsList = searchResults.map((user) => (
    <User key={user._id} user={user} selected={newGroupUsers.includes(user._id)} onSelect={() => onSelect(user._id)} />
  ));

  function Notice({ text }) {
    return <div className="notice">{text}</div>;
  }

  const createGroup = (e) => {
    e.preventDefault();
    if (newGroupUsers.length > 1) setPanel('createGroup2');
    else setError(true);
  };

  return (
    <div className="group-create">
      <TopBar />
      <SearchBar />
      <button
        className="uk-margin-remove uk-button uk-button-large uk-button-primary create-button"
        onClick={createGroup}
      >
        Select Users
      </button>
      <div className="selection-text error" hidden={newGroupUsers.length <= 1 || !error}>
        You must select some people!
      </div>
      <div className="selection-text" hidden={newGroupUsers.length <= 1}>
        {newGroupUsers.length - 1}
        {' '}
        selected -
        <a onClick={() => setNewGroupUsers([user.id])}>Clear</a>
      </div>
      <div className="rooms">
        {searchResultsList}
        {searchResults.length === 0 && <Notice text={`There are no users available for "${searchText}"`} />}
      </div>
    </div>
  );
}

export default Panel;
