import { useEffect, useState } from 'react';
import './Ringing.sass';
import { FiVideo, FiPhone, FiPhoneOff } from 'react-icons/fi';
import { useGlobal } from 'reactn';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useToasts } from 'react-toast-notifications';
import logo from '../../../assets/logo.png';
import postClose from '../../../actions/postClose';
import postAnswer from '../../../actions/postAnswer';
import Config from '../../../config';
import ringSound from '../../../assets/ring.mp3';
import Actions from '../../../constants/Actions';

function Ringing({ incoming, meetingID }) {
  const counterpart = useSelector((state) => state.rtc.counterpart) || {};
  const [isAudio, setAudio] = useGlobal('audio');
  const [isVideo, setVideo] = useGlobal('video');
  const [audioStream, setAudioStream] = useGlobal('audioStream');
  const [videoStream, setVideoStream] = useGlobal('videoStream');
  const setAccepted = useGlobal('accepted')[1];
  const callData = useSelector((state) => state.rtc.callData) || {};
  const [acquireError, setAcquireError] = useState(false);
  const closingState = useSelector((state) => state.rtc.closingState);
  const closed = useSelector((state) => state.rtc.closed);

  const navigate = useNavigate();
  const { addToast } = useToasts();
  const dispatch = useDispatch();

  const errorToast = (content) => {
    addToast(content, {
      appearance: 'error',
      autoDismiss: true,
    });
  };

  const getAudio = async () => {
    setAcquireError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      await setAudioStream(stream);
    } catch (e) {
      setAcquireError(true);
      errorToast('Failed to acquire audio!');
    }
  };
  const getVideo = async () => {
    setAcquireError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      await setVideoStream(stream);
    } catch (e) {
      setAcquireError(true);
      errorToast('Failed to acquire audio!');
    }
  };

  useEffect(() => {
    if (isAudio) getAudio();
    if (isVideo) getVideo();

    const audio = document.createElement('audio');
    audio.style.display = 'none';
    audio.src = ringSound;
    audio.autoplay = true;
    audio.loop = true;

    return () => {
      if (audio) {
        audio.pause();
        audio.remove();
      }
    };
  }, []);

  const close = (closingState) => {
    if (isVideo && videoStream) videoStream.getVideoTracks()[0].stop();
    if (isAudio && audioStream) audioStream.getAudioTracks()[0].stop();
    dispatch({ type: Actions.RTC_LEAVE });
    if (closingState) postClose({ meetingID, userID: counterpart._id });
    navigate('/', { replace: true });

    console.log('close action ringing');
  };

  useEffect(() => {
    if (closingState && !closed) close(true);
  }, [closingState, closed]);

  const join = async () => {
    await setAudio(true);
    await setVideo(false);
    await getAudio();
    if (acquireError) return;
    setAccepted(true);
    postAnswer({ userID: callData.caller, meetingID });
  };

  const joinWithVideo = async () => {
    await setAudio(true);
    await setVideo(true);
    await getVideo();
    if (acquireError) return;
    await getAudio();
    if (acquireError) return;
    setAccepted(true);
    postAnswer({ userID: callData.caller, meetingID });
  };

  function Picture() {
    if (!counterpart.firstName) counterpart.firstName = 'Anonymous';
    if (!counterpart.lastName) counterpart.lastName = 'User';
    if (counterpart.picture) {
      return (
        <img
          src={`${Config.url || ''}/api/images/${counterpart.picture.shieldedID}/256`}
          alt="Picture"
          className="picture"
        />
      );
    }
    return (
      <div className="img-wrapper">
        <div className="img">
          {counterpart.firstName.substr(0, 1)}
          {counterpart.lastName.substr(0, 1)}
        </div>
      </div>
    );
  }

  const getTitle = () => {
    if (incoming) {
      if (callData.added) return 'Adding you to a meeting';
      return 'Incoming Call';
    }

    return 'Outgoing Call';
  };

  return (
    <div className="join uk-flex uk-flex-middle uk-flex-center uk-flex-column">
      <img className="logo-little" src={logo} alt="Logo" />
      <p className="title">{getTitle()}</p>
      <p className="name">Delta Honey</p>
      <div className="picture uk-margin-small">
        <Picture />
      </div>
      <div className="uk-flex" hidden={!incoming}>
        <div className="rounded-button close" onClick={close}>
          <FiPhoneOff className="button-icon" />
        </div>
        <div className="rounded-button" onClick={join}>
          <FiPhone className="button-icon" />
        </div>
        <div className="rounded-button" onClick={joinWithVideo}>
          <FiVideo className="button-icon" />
        </div>
      </div>
      <div className="uk-flex" hidden={incoming}>
        <div className="rounded-button close" onClick={close}>
          <FiPhoneOff className="button-icon" />
        </div>
      </div>
    </div>
  );
}

export default Ringing;
