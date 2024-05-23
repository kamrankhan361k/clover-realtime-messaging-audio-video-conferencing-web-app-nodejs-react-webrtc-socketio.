import { useGlobal } from 'reactn';
import './Meeting.sass';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

function Meetings({ meeting }) {
  const setMeeting = useGlobal('meetingID')[1];
  const setOver = useGlobal('over')[1];
  const setShowPanel = useGlobal('showPanel')[1];
  const user = useGlobal('user')[0];

  const navigate = useNavigate();

  let text;

  if (meeting.peers.length > 0) text = `${meeting.peers.length} peers connected`;
  else if (meeting.lastLeave) text = `Meeting ended ${moment(meeting.lastLeave).fromNow()}`;

  const incoming = meeting.callee && user.id === meeting.callee._id;
  console.log(meeting);

  return (
    <div
      className="meeting-entry uk-flex uk-flex-center uk-flex-middle"
      onClick={() => {
        setMeeting(meeting._id);
        setShowPanel(false);
        setOver(true);
        navigate(`/meeting/${meeting._id}`, { replace: true });
      }}
    >
      <div className="img-wrapper">
        <div className={`img-content${meeting.peers.length ? ' active' : ''}`}>{meeting.peers.length}</div>
      </div>
      <div className="text">
        <div className="title">
          {meeting.startedAsCall
            ? meeting.callToGroup
              ? `Group call in ${meeting.group.title}`
              : incoming
                ? `Call from ${meeting.caller ? meeting.caller.firstName : 'Deleted'} ${
                  meeting.caller ? meeting.caller.lastName : 'User'
                }`
                : `Call to ${meeting.callee ? meeting.callee.firstName : 'Deleted'} ${
                  meeting.callee ? meeting.callee.lastName : 'User'
                }`
            : 'Untitled Meeting'}
        </div>
        <div className="message">{text}</div>
        <div className="message">
          ID:
          {meeting._id}
        </div>
      </div>
    </div>
  );
}

export default Meetings;
