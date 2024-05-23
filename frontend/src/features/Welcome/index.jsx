import { useGlobal } from 'reactn';
import Picture from '../../components/Picture';
import TopBar from './components/TopBar';
import BottomBar from './components/BottomBar';

function Welcome() {
  const user = useGlobal('user')[0];
  const setOver = useGlobal('over')[1];

  const back = () => setOver(false);

  return (
    <div className="content uk-flex uk-flex-column">
      <TopBar back={back} />
      <div className="content uk-flex uk-flex-center uk-flex-middle uk-flex-column">
        <div className="welcome uk-flex uk-flex-bottom">
          {user.firstName}
          {' '}
          {user.lastName}
        </div>
        <div className="profile">
          <Picture user={user} />
        </div>
        <div className="tutorial uk-flex uk-flex-top uk-flex-column uk-flex-center uk-flex-middle">
          Search for someone to start a conversation,
          <br />
          Add contacts to your favorites to reach them faster
        </div>
      </div>
      <BottomBar />
    </div>
  );
}

export default Welcome;
