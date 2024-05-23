import './BottomBar.sass';
import { useGlobal } from 'reactn';
import Config from '../../../config';

function BottomBar() {
  const version = useGlobal('version')[0];

  return (
    <div className="bottom-bar uk-flex uk-flex-between uk-flex-middle">
      <div className="profile" />
      <div className="nav">
        <div className="button">
          {Config.appName}
          {' '}
          v
          {version}
          {' '}
          -
          <a href="https://www.honeyside.it" target="_blank" rel="noreferrer">
            {Config.brand}
          </a>
        </div>
      </div>
    </div>
  );
}

export default BottomBar;
