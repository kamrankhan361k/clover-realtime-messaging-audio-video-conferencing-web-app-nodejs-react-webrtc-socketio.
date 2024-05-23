import { useEffect, useRef } from 'react';
import './Join.sass';
import {
  FiVideo, FiMic, FiVideoOff, FiMicOff,
} from 'react-icons/fi';
import { useGlobal } from 'reactn';
import logo from '../../../assets/logo.png';

function Join({ onJoin }) {
  const [isAudio, setAudio] = useGlobal('audio');
  const [isVideo, setVideo] = useGlobal('video');
  const [audio, setAudioStream] = useGlobal('audioStream');
  const [video, setVideoStream] = useGlobal('videoStream');
  const localVideoRef = useRef(null);

  const getAudio = () => navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    setAudioStream(stream);
  });
  const getVideo = () => navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    setVideoStream(stream);
    localVideoRef.current.srcObject = stream;
  });

  useEffect(() => {
    if (isVideo) getVideo();
    if (isAudio) getAudio();
  }, []);

  const onChangeAudio = (e) => {
    if (e.target.checked) getAudio();
    else audio.getTracks().forEach((track) => track.stop());
    setAudio(e.target.checked);
  };

  const onChangeVideo = (e) => {
    if (e.target.checked) getVideo();
    else video.getTracks().forEach((track) => track.stop());
    setVideo(e.target.checked);
  };

  return (
    <div className="join uk-flex uk-flex-middle uk-flex-center uk-flex-column">
      <img className="logo-little" src={logo} alt="Logo" />
      <p className="title">Join Meeting</p>
      <p hidden={isVideo || isAudio}>Join as spectator.</p>
      <video
        hidden={!isVideo}
        className="local-video"
        ref={localVideoRef}
        onLoadedMetadata={() => localVideoRef.current.play()}
        playsInline
      />
      <p hidden={!isAudio} style={{ marginTop: isVideo ? 0 : 20 }}>
        Speak to test audio.
      </p>
      <div className="uk-flex">
        <div className="controls">
          {isAudio ? <FiMic className="icon" /> : <FiMicOff className="icon" />}
          <label className="switch">
            <input type="checkbox" checked={isAudio} onChange={onChangeAudio} />
            <span className="slider round" />
          </label>
        </div>
        <div className="controls">
          <label className="switch">
            <input type="checkbox" checked={isVideo} onChange={onChangeVideo} />
            <span className="slider round" />
          </label>
          {isVideo ? <FiVideo className="icon" /> : <FiVideoOff className="icon" />}
        </div>
      </div>
      <button className="button uk-button uk-button-primary" onClick={onJoin}>
        Join
      </button>
    </div>
  );
}

export default Join;
