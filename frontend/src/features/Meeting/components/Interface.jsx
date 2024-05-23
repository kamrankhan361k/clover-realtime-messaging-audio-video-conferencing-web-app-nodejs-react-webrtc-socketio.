import { useEffect, useRef } from 'react';
import './Interface.sass';
import Picture from '../../../components/Picture';

function Interface({
  audio, video, peer, isMaximized, isScreen,
}) {
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!audio) return;
    if (audio) audioRef.current.srcObject = audio;
  }, [audio]);

  useEffect(() => {
    if (!video) return;
    if (video) videoRef.current.srcObject = video;
  }, [video]);

  return (
    <div className="interface uk-flex uk-flex-middle uk-flex-center uk-flex-column uk-height-1-1">
      {audio && (
        <audio
          ref={audioRef}
          onLoadedMetadata={() => audioRef.current.play()}
          className="remote-audio"
          controls={false}
          hidden
          data-user={peer}
        />
      )}
      {video && (
        <video
          ref={videoRef}
          onLoadedMetadata={() => videoRef.current.play()}
          className="remote-video"
          playsInline
          controls={false}
          hidden={false}
          data-user={peer}
          style={{ objectFit: !isMaximized || isScreen ? 'contain' : 'cover' }}
        />
      )}
      {!video && (
        <div className="remote-peer">
          <div className="name">
            {peer.firstName}
            {' '}
            {peer.lastName}
          </div>
          <Picture user={peer} />
          <div className="status">{!video && !audio ? 'Spectator' : 'Audio Only'}</div>
        </div>
      )}
    </div>
  );
}

export default Interface;
