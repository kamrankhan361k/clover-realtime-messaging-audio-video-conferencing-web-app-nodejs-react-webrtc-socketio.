import { useEffect, useState } from 'react';
import { useGlobal } from 'reactn';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import ClipLoader from 'react-spinners/ClipLoader';
import TopBar from './components/TopBar';
import BottomBar from './components/BottomBar';
import './Conversation.sass';
import getRoom from '../../actions/getRoom';
import Messages from './components/Messages';
import Actions from '../../constants/Actions';

function Conversation() {
  const room = useSelector((state) => state.io.room);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const setOver = useGlobal('over')[1];
  const { id } = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const back = () => {
    setOver(false);
    navigate('/', { replace: true });
  };

  useEffect(() => {
    setLoading(true);
    getRoom(id)
      .then((res) => {
        dispatch({ type: Actions.SET_ROOM, room: res.data.room });
        console.log(res.data);
        dispatch({ type: Actions.SET_MESSAGES, messages: res.data.room.messages });
        setLoading(false);
        setError(false);
        dispatch({ type: Actions.MESSAGES_REMOVE_ROOM_UNREAD, roomID: id });
      })
      .catch((err) => {
        dispatch({ type: Actions.SET_ROOM, room: null });
        dispatch({ type: Actions.SET_MESSAGES, messages: [] });
        setLoading(false);
        if (!err.response || err.response.status !== 404) setError(true);
      });
  }, [setLoading, id]);

  function Loading() {
    return (
      <div className="content uk-flex uk-flex-center uk-flex-middle uk-flex-column">
        <ClipLoader size={60} color="#666" loading={loading} />
      </div>
    );
  }

  function NotFound() {
    return (
      <div className="content uk-flex uk-flex-center uk-flex-middle uk-flex-column">
        <div className="notfound">Room Not Found</div>
        <div className="notfound-extended">
          This room does not exist.
          <br />
          This is probably a broken URL.
        </div>
      </div>
    );
  }

  function Error() {
    return (
      <div className="content uk-flex uk-flex-center uk-flex-middle uk-flex-column">
        <div className="notfound">Network Error</div>
        <div className="notfound-extended">Could not reach server.</div>
      </div>
    );
  }

  function Content() {
    return <Messages />;
  }

  return (
    <div className="content uk-flex uk-flex-column uk-flex-between">
      <TopBar back={back} loading={loading} />
      {loading && <Loading />}
      {error && <Error />}
      {!room && !loading && !error && <NotFound />}
      {room && !loading && <Content />}
      <BottomBar />
    </div>
  );
}

export default Conversation;
