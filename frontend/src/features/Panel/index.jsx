import { useEffect } from 'react';
import { useGlobal } from 'reactn';
import './Panel.sass';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import TopBar from './components/TopBar';
import SearchBar from './components/SearchBar';
import NavBar from './components/NavBar';
import MeetingBar from './components/MeetingBar';
import Room from './components/Room';
import Meeting from './components/Meeting';
import User from './components/User';
import getRooms from '../../actions/getRooms';
import search from '../../actions/search';
import getFavorites from '../../actions/getFavorites';
import getMeetings from '../../actions/getMeetings';
import Actions from '../../constants/Actions';
import Settings from './components/Settings';

function Panel() {
  const nav = useGlobal('nav')[0];
  const searchText = useGlobal('search')[0];
  const rooms = useSelector((state) => state.io.rooms);
  const [searchResults, setSearchResults] = useGlobal('searchResults');
  const [favorites, setFavorites] = useGlobal('favorites');
  const [meetings, setMeetings] = useGlobal('meetings');
  const [callStatus] = useGlobal('callStatus');
  const [over] = useGlobal('over');
  const refreshMeetings = useSelector((state) => state.io.refreshMeetings);

  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    getRooms()
      .then((res) => dispatch({ type: Actions.SET_ROOMS, rooms: res.data.rooms }))
      .catch((err) => console.log(err));
    search()
      .then((res) => setSearchResults(res.data.users))
      .catch((err) => console.log(err));
    getFavorites()
      .then((res) => setFavorites(res.data.favorites))
      .catch((err) => console.log(err));
    getMeetings()
      .then((res) => setMeetings(res.data.meetings))
      .catch((err) => console.log(err));
  }, [setSearchResults, setFavorites]);

  useEffect(() => {
    getMeetings()
      .then((res) => setMeetings(res.data.meetings))
      .catch((err) => console.log(err));
  }, [refreshMeetings]);

  const roomsList = rooms.map((room) => <Room key={room._id} room={room} />);
  const searchResultsList = searchResults.map((user) => <User key={user._id} user={user} />);
  const favoritesList = favorites.map((room) => <Room key={room._id} room={room} />);
  const meetingsList = meetings.map((meeting) => <Meeting key={meeting._id} meeting={meeting} />);

  function Notice({ text }) {
    return <div className="notice">{text}</div>;
  }

  return (
    <div className="panel">
      <TopBar />
      <SearchBar />
      <NavBar />
      {callStatus === 'in-call' && (!location.pathname.startsWith('/meeting') || over === false) && <MeetingBar />}
      <div className="rooms">
        {nav === 'rooms' && roomsList}
        {nav === 'rooms' && rooms.length === 0 && (
          <Notice text="There are no rooms yet. Contact someone or create a group to begin!" />
        )}
        {nav === 'search' && searchResultsList}
        {nav === 'search' && searchResults.length === 0 && (
          <Notice text={`There are no search results for "${searchText}"`} />
        )}
        {nav === 'favorites' && favoritesList}
        {nav === 'favorites' && favorites.length === 0 && (
          <Notice text="There are no favorites yet. Add a room to your favorites!" />
        )}
        {nav === 'meetings' && meetingsList}
        {nav === 'meetings' && meetings.length === 0 && (
          <Notice text="There are no meetings yet. Create a new meeting or call someone!" />
        )}
        {nav === 'settings' && <Settings />}
      </div>
    </div>
  );
}

export default Panel;
