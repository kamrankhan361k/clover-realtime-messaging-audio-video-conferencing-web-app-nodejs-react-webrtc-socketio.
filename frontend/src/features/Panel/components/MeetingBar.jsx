import { useGlobal } from 'reactn';
import './MeetingBar.sass';
import { useNavigate } from 'react-router-dom';

function MeetingBar() {
  const [meeting] = useGlobal('meetingID');
  const setOver = useGlobal('over')[1];
  const setShowPanel = useGlobal('showPanel')[1];

  const navigate = useNavigate();

  return (
    <div
      className="meeting-bar uk-flex uk-flex-center uk-flex-middle"
      onClick={() => {
        setShowPanel(false);
        setOver(true);
        navigate(`/meeting/${meeting}`, { replace: true });
      }}
    >
      Go back to the meeting
    </div>
  );
}

export default MeetingBar;
