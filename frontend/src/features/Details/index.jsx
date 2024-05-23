import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Info from './components/Info';
import Room from './components/Room';
import './Details.sass';
import TopBar from './components/TopBar';

function Details() {
  const location = useLocation();
  const room = useSelector((state) => state.io.room);

  const navigate = useNavigate();

  const back = () => navigate(`/room/${room._id}`, { replace: true });

  const getComponent = () => {
    if (location.pathname.startsWith('/room') && room) return <Room />;
    if (expand && room) return <Room />;
    return <Info />;
  };

  const expand = location.pathname.endsWith('/info');

  return (
    <div className={`details${expand ? ' expand' : ' uk-visible@l'}`}>
      {expand && <TopBar back={back} />}
      {getComponent(expand)}
    </div>
  );
}

export default Details;
