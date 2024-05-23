import { useEffect, useRef, useState } from 'react';
import './Meeting.sass';
import {
  FiMaximize,
  FiMic,
  FiMicOff,
  FiMinimize,
  FiPhoneOff,
  FiVideo,
  FiVideoOff,
  FiUserPlus,
  FiMonitor,
  FiXOctagon,
  FiGrid,
  FiColumns,
  FiMenu,
  FiChevronLeft,
  FiChevronUp,
  FiChevronDown,
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import * as mediasoup from 'mediasoup-client';
import { useNavigate, useParams } from 'react-router-dom';
import { useGlobal, getGlobal } from 'reactn';
import Actions from '../../constants/Actions';
import Join from './components/Join';
import AddPeers from './components/AddPeers';
import Ringing from './components/Ringing';
import Streams from './components/Streams';
import LittleStreams from './components/LittleStreams';
import postClose from '../../actions/postClose';

let transport;
let videoProducer;
let screenProducer;
let audioProducer;

function Meeting() {
  const [device, setDevice] = useState(null);
  const io = useSelector((state) => state.io.io);
  const producers = useSelector((state) => state.rtc.producers);
  const lastLeave = useSelector((state) => state.rtc.lastLeave);
  const lastLeaveType = useSelector((state) => state.rtc.lastLeaveType);
  const increment = useSelector((state) => state.rtc.increment);
  const closingState = useSelector((state) => state.rtc.closingState);
  const [streams, setStreams] = useGlobal('streams');
  const [localStream, setLocalStream] = useGlobal('localStream');
  const [video, setVideo] = useGlobal('video');
  const [audio, setAudio] = useGlobal('audio');
  const [isScreen, setScreen] = useGlobal('screen');
  const [audioStream, setAudioStream] = useGlobal('audioStream');
  const [videoStream, setVideoStream] = useGlobal('videoStream');
  const setScreenStream = useGlobal('screenStream')[1];
  const [callStatus, setCallStatus] = useGlobal('callStatus');
  const callDirection = useGlobal('callDirection')[0];
  const [joined, setJoined] = useGlobal('joined');
  const [isMaximized, setMaximized] = useState(true);
  const [isGrid, setGrid] = useState(true);
  const [topBar, setTopBar] = useState(true);
  const [acccepted, setAccepted] = useGlobal('accepted');
  const [showPanel, setShowPanel] = useGlobal('showPanel');
  const setOver = useGlobal('over')[1];
  const setMeeting = useGlobal('meetingID')[1];
  const [addPeers, setAddPeers] = useState(false);
  const counterpart = useSelector((state) => state.rtc.counterpart) || {};

  const answerIncrement = useSelector((state) => state.rtc.answerIncrement);
  const answerData = useSelector((state) => state.rtc.answerData);

  const params = useParams();
  const roomID = params.id;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!answerData) return;
    if (callDirection === 'outgoing' && callStatus !== 'in-call' && answerData.meetingID === roomID) {
      setJoined(true);
      init();
    }
  }, [answerIncrement, answerData]);

  useEffect(() => {
    if (acccepted) {
      setAccepted(false).then(() => {
        setJoined(true);
        init();
      });
    }
  }, [acccepted]);

  useEffect(() => {
    setMeeting(roomID);
    return () => {
      if (getGlobal().callStatus !== 'in-call') {
        try {
          if (getGlobal().audioStream) {
            getGlobal()
              .audioStream.getTracks()
              .forEach((track) => track.stop());
          }
        } catch (e) {}
        try {
          if (getGlobal().videoStream) {
            getGlobal()
              .videoStream.getTracks()
              .forEach((track) => track.stop());
          }
        } catch (e) {}
      }
    };
  }, []);

  const getAudio = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setAudioStream(stream);
    return stream;
  };
  const getVideo = async () => {
    const stream = navigator.mediaDevices.getUserMedia({ video: true });
    setVideoStream(stream);
    return stream;
  };
  const getScreen = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    setScreenStream(stream);
    return stream;
  };

  const produceAudio = async (stream) => {
    const useStream = stream || audioStream;
    setAudio(true);
    try {
      const track = useStream.getAudioTracks()[0];
      const params = { track };
      audioProducer = await transport.produce(params);
    } catch (err) {
      console.log('getusermedia produce failed', err);
      setAudio(false);
    }
  };

  const produceVideo = async (stream) => {
    const useStream = stream || videoStream;
    setVideo(true);
    try {
      const track = useStream.getVideoTracks()[0];
      const params = { track, appData: { isScreen: false } };
      await setLocalStream(useStream);
      videoProducer = await transport.produce(params);
    } catch (err) {
      console.log('getusermedia produce failed', err);
      setVideo(false);
    }
  };

  const produceScreen = async (stream) => {
    try {
      const track = stream.getVideoTracks()[0];
      const params = { track, appData: { isScreen: true } };
      await setLocalStream(stream);
      screenProducer = await transport.produce(params);
      await setScreen(true);
    } catch (err) {
      console.log('getusermedia produce failed', err);
    }
  };

  const stopScreen = async () => {
    try {
      if (localStream) localStream.getVideoTracks()[0].stop();
      await io.request('remove', { producerID: screenProducer.id, roomID });
      screenProducer.close();
      screenProducer = null;
      await setScreen(false);
    } catch (e) {
      console.log(e);
    }
  };

  const stopVideo = async () => {
    try {
      if (localStream) localStream.getVideoTracks()[0].stop();
      await io.request('remove', { producerID: videoProducer.id, roomID });
      videoProducer.close();
      videoProducer = null;
      await setVideo(false);
    } catch (e) {
      console.log(e);
    }
  };

  const stopAudio = async () => {
    try {
      await io.request('remove', { producerID: audioProducer.id, roomID });
      audioProducer.close();
      audioProducer = null;
      await setAudio(false);
    } catch (e) {
      console.log(e);
    }
  };

  const init = async () => {
    await setCallStatus('in-call');
    await setShowPanel(false);
    await setOver(true);

    window.consumers = [];
    await setStreams([]);

    dispatch({ type: Actions.RTC_ROOM_ID, roomID });

    const { producers, consumers, peers } = await io.request('join', { roomID });

    dispatch({ type: Actions.RTC_CONSUMERS, consumers, peers });

    const routerRtpCapabilities = await io.request('getRouterRtpCapabilities');
    const device = new mediasoup.Device();
    await device.load({ routerRtpCapabilities });

    setDevice(device);

    await subscribe(device);

    dispatch({ type: Actions.RTC_PRODUCERS, producers: producers || [] });

    const data = await io.request('createProducerTransport', {
      forceTcp: false,
      rtpCapabilities: device.rtpCapabilities,
      roomID,
    });

    if (data.error) {
      console.error(data.error);
      return;
    }

    transport = device.createSendTransport(data);
    transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
      io.request('connectProducerTransport', { dtlsParameters }).then(callback).catch(errback);
    });

    transport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
      try {
        const { id } = await io.request('produce', {
          transportId: transport.id,
          kind,
          rtpParameters,
          roomID,
          isScreen: appData && appData.isScreen,
        });
        callback({ id });
      } catch (err) {
        errback(err);
      }
    });

    transport.on('connectionstatechange', (state) => {
      switch (state) {
        case 'connecting':
          break;

        case 'connected':
          // document.querySelector('#local_video').srcObject = stream;
          break;

        case 'failed':
          transport.close();
          break;

        default:
          break;
      }
    });

    await produceAudio();
    await produceVideo();
  };

  useEffect(() => {
    if (lastLeaveType === 'leave') setStreams(getGlobal().streams.filter((s) => s.socketID !== lastLeave));
    else setStreams(getGlobal().streams.filter((s) => s.producerID !== lastLeave));
  }, [lastLeave, lastLeaveType, setStreams, increment]);

  useEffect(() => {
    const init = async () => {
      if (!window.consumers) {
        window.consumers = [];
      }
      const newStreams = [];
      for (const producer of producers) {
        if (!window.consumers.includes(producer.producerID) && producer.roomID === roomID) {
          window.consumers.push(producer.producerID);

          const stream = await consume(window.transport, producer);

          stream.producerID = producer.producerID;
          stream.socketID = producer.socketID;
          stream.userID = producer.userID;

          newStreams.push(stream);

          io.request('resume', { producerID: producer.producerID, meetingID: roomID });
        }
      }
      setStreams([...getGlobal().streams, ...newStreams]);
    };
    init();
  }, [producers]);

  const consume = async (transport, producer) => {
    const { rtpCapabilities } = device;
    const data = await io.request('consume', {
      rtpCapabilities,
      socketID: producer.socketID,
      roomID,
      producerID: producer.producerID,
    });
    const {
      producerId, id, kind, rtpParameters,
    } = data;

    const codecOptions = {};
    const consumer = await transport.consume({
      id,
      producerId,
      kind,
      rtpParameters,
      codecOptions,
    });
    consumer.on('producerclose', () => {
      console.log('associated producer closed so consumer closed');
    });
    consumer.on('close', () => {
      console.log('consumer closed');
    });
    const stream = new MediaStream();
    stream.addTrack(consumer.track);
    stream.isVideo = kind === 'video';
    return stream;
  };

  const subscribe = async (device, socketID) => {
    const data = await io.request('createConsumerTransport', {
      forceTcp: false,
      roomID,
      socketID,
    });

    if (data.error) {
      console.error(data.error);
      return;
    }

    const transport = device.createRecvTransport(data);
    transport.on('connect', ({ dtlsParameters }, callback, errback) => {
      io.request('connectConsumerTransport', {
        transportId: transport.id,
        dtlsParameters,
        socketID,
      })
        .then(callback)
        .catch(errback);
    });

    transport.on('connectionstatechange', async (state) => {
      switch (state) {
        case 'connecting':
          break;

        case 'connected':
          // document.querySelector('#remote_video').srcObject = await stream;
          for (const producer of producers) {
            await io.request('resume', { producerID: producer.producerID });
          }
          break;

        case 'failed':
          transport.close();
          break;

        default:
          break;
      }
    });

    window.transport = transport;
  };

  const close = async () => {
    try {
      localStream.getVideoTracks()[0].stop();
    } catch (e) {}
    await setStreams([]);
    try {
      transport.close();
    } catch (e) {}
    try {
      await io.request('leave', { roomID });
    } catch (e) {}
    postClose({ roomID, userID: counterpart._id });
    navigate('/', { replace: true });
    await setJoined(false);
    await setShowPanel(true);
    await setCallStatus(null);
    dispatch({ type: Actions.RTC_LEAVE });
    console.log('close action meeting');
  };

  useEffect(() => {
    if (closingState && joined) close();
  }, [closingState]);

  if (callDirection === 'incoming' && !joined) {
    return (
      <div className="content uk-flex uk-flex-column uk-flex-center uk-flex-middle" style={{ background: 'black' }}>
        <Ringing
          incoming
          meetingID={roomID}
          onJoin={() => {
            setJoined(true);
            init();
          }}
        />
      </div>
    );
  }

  if (callDirection === 'outgoing' && !joined) {
    return (
      <div className="content uk-flex uk-flex-column uk-flex-center uk-flex-middle" style={{ background: 'black' }}>
        <Ringing incoming={false} meetingID={roomID} />
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="content uk-flex uk-flex-column uk-flex-center uk-flex-middle" style={{ background: 'black' }}>
        <Join
          onJoin={() => {
            setJoined(true);
            init();
          }}
        />
      </div>
    );
  }

  function TopBar({ localStream }) {
    const localVideoRef = useRef(null);

    useEffect(() => {
      if (!localStream) return;
      localVideoRef.current.srcObject = localStream;
    }, [localStream]);

    return (
      <div className="meeting-top-controls">
        <div
          className="panel-control"
          onClick={() => {
            setShowPanel(!showPanel);
            setOver(showPanel);
          }}
        >
          {showPanel ? <FiChevronLeft /> : <FiMenu />}
        </div>
        <LittleStreams streams={streams} />
        <div className="videos" style={{ flexGrow: 0 }}>
          <video
            hidden={!video && !isScreen}
            className="video"
            onLoadedMetadata={() => localVideoRef.current.play()}
            ref={localVideoRef}
            style={{ objectFit: 'cover', background: 'black', zIndex: 1000 }}
            playsInline
          />
        </div>
        <div className="panel-control" onClick={() => setTopBar(!topBar)}>
          {topBar ? <FiChevronDown /> : <FiChevronUp />}
        </div>
      </div>
    );
  }

  function TopBarTransparent({ localStream }) {
    const localVideoRef = useRef(null);

    useEffect(() => {
      if (!localVideoRef) return;
      localVideoRef.current.srcObject = localStream;
    }, [localVideoRef]);

    return (
      <div className="meeting-top-controls-transparent">
        <div
          className="panel-control"
          onClick={() => {
            setShowPanel(!showPanel);
            setOver(showPanel);
          }}
        >
          {showPanel ? <FiChevronLeft /> : <FiMenu />}
        </div>
        <div className="videos" style={{ flexGrow: 0, minWidth: video || isScreen ? 137 : 0 }}>
          <video
            hidden={!video && !isScreen}
            className="video"
            onLoadedMetadata={() => localVideoRef.current.play()}
            ref={localVideoRef}
            style={{ objectFit: 'cover', background: 'black', zIndex: 1000 }}
            playsInline
          />
        </div>
      </div>
    );
  }

  return (
    <div className="meeting-main uk-flex uk-flex-column">
      {isGrid && <TopBarTransparent localStream={localStream} />}
      {!isGrid && topBar && <TopBar localStream={localStream} />}
      <Streams
        isGrid={isGrid}
        streams={streams}
        localStream={localStream}
        isVideo={video}
        isScreen={isScreen}
        isMaximized={isMaximized}
      >
        <div className="meeting-controls" style={{ bottom: topBar || isGrid ? 0 : 95 }}>
          <div
            className="control"
            onClick={() => (video ? stopVideo() : getVideo().then((stream) => produceVideo(stream)))}
          >
            {video ? <FiVideo /> : <FiVideoOff />}
          </div>
          <div
            className="control"
            onClick={() => (audio ? stopAudio() : getAudio().then((stream) => produceAudio(stream)))}
          >
            {audio ? <FiMic /> : <FiMicOff />}
          </div>
          <div
            className="control"
            onClick={() => (isScreen ? stopScreen() : getScreen().then((stream) => produceScreen(stream)))}
          >
            {isScreen ? <FiXOctagon /> : <FiMonitor />}
          </div>
          <div className="close" onClick={close}>
            <FiPhoneOff />
          </div>
          <div className="control" onClick={() => setAddPeers(true)}>
            <FiUserPlus />
          </div>
          <div className="control" onClick={() => setMaximized(!isMaximized)}>
            {isMaximized ? <FiMaximize /> : <FiMinimize />}
          </div>
          <div className="control" onClick={() => setGrid(!isGrid)}>
            {isGrid ? <FiGrid /> : <FiColumns />}
          </div>
        </div>
      </Streams>
      {!isGrid && !topBar && <TopBar localStream={localStream} />}
      {addPeers && <AddPeers onClose={() => setAddPeers(false)} />}
    </div>
  );
}

export default Meeting;
