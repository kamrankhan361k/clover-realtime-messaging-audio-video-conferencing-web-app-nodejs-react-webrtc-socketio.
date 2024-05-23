import { useGlobal } from 'reactn';
import Config from '../../../config';

function Credits() {
  return (
    <span>
      {' '}
      -
      <a
        data-uk-tooltip="Special thanks and open source resources in use"
        data-uk-toggle="target: .toggle-credits ;animation: uk-animation-fade"
      >
        Credits
      </a>
    </span>
  );
}

function Copyright() {
  const version = useGlobal('version')[0];
  return (
    <div id="copyright" className="uk-position-bottom-center uk-position-small uk-visible@m uk-position-z-index">
      <span className="uk-text-small uk-text-muted">
        © 2020
        {Config.brand || 'Honeyside'}
        {Config.showCredits && <Credits />}
        {' '}
        - v
        {version}
      </span>
    </div>
  );
}

export default Copyright;
