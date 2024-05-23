import { useGlobal } from 'reactn';
import TopBar from './components/TopBar';
import BottomBar from './components/BottomBar';
import './NotFound.sass';

function NotFound() {
  const setOver = useGlobal('over')[1];

  const back = () => setOver(false);

  return (
    <div className="content uk-flex uk-flex-column">
      <TopBar back={back} />
      <div className="content uk-flex uk-flex-center uk-flex-middle uk-flex-column">
        <div className="notfound">404</div>
        <div className="notfound-extended">
          This page does not exist.
          <br />
          There is just an empty void here.
        </div>
      </div>
      <BottomBar />
    </div>
  );
}

export default NotFound;
