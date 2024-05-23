import { useGlobal } from 'reactn';
import './NavBar.sass';
import {
  FiMessageCircle, FiStar, FiUsers, FiSearch,
} from 'react-icons/fi';

function NavBar() {
  const [nav, setNav] = useGlobal('nav');

  return (
    <div className="nav-bar uk-flex">
      <div className={`item${nav === 'rooms' ? ' active' : ''}`} onClick={() => setNav('rooms')}>
        <div className="icon">
          <FiMessageCircle />
        </div>
        <div className="text">Rooms</div>
      </div>
      <div className={`item${nav === 'search' ? ' active' : ''}`} onClick={() => setNav('search')}>
        <div className="icon">
          <FiSearch />
        </div>
        <div className="text">Search</div>
      </div>
      <div className={`item${nav === 'favorites' ? ' active' : ''}`} onClick={() => setNav('favorites')}>
        <div className="icon">
          <FiStar />
        </div>
        <div className="text">Favorites</div>
      </div>
      <div
        className={`item${nav === 'meetings' ? ' active' : ''}`}
        onClick={() => {
          setNav('meetings');
        }}
      >
        <div className="icon">
          <FiUsers />
        </div>
        <div className="text">Meetings</div>
      </div>
    </div>
  );
}

export default NavBar;
