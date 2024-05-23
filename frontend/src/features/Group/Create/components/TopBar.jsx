import './TopBar.sass';
import { FiArrowLeft } from 'react-icons/fi';
import { useGlobal } from 'reactn';
import Picture from '../../../../components/Picture';

function TopBar() {
  const setPanel = useGlobal('panel')[1];
  const room = { title: 'Group', isGroup: true };
  const title = useGlobal('groupTitle')[0];

  return (
    <div className="top-bar-group uk-flex uk-flex-between uk-flex-middle">
      <div className="nav">
        <div className="button" onClick={() => setPanel('standard')}>
          <FiArrowLeft />
        </div>
        <div className="profile conversation">
          <Picture user={room} group={room.isGroup} picture={room.picture} title={room.title} />
        </div>
        <div className="text">
          <div className="title">Create Group</div>
          <div className="message">{title || 'Type a group name...'}</div>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
