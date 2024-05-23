import './Streams.sass';
import { useSelector } from 'react-redux';
import { useGlobal } from 'reactn';
import Interface from './Interface';

function Streams({
  streams, children, isMaximized, isGrid,
}) {
  const consumers = useSelector((state) => state.rtc.consumers);
  const producers = useSelector((state) => state.rtc.producers);
  const peers = useSelector((state) => state.rtc.peers);
  const socketID = useSelector((state) => state.io.id);
  const [mainStream, setMainStream] = useGlobal('mainStream');

  const actualConsumers = consumers.filter((c) => c !== socketID);
  const actualPeers = [];
  actualConsumers.forEach((consumerID) => {
    const actualPeer = {
      ...peers[consumerID],
      video: null,
      audio: null,
      screen: null,
    };
    const peerStreams = streams.filter((s) => s.socketID === consumerID);
    peerStreams.forEach((stream) => {
      actualPeer.streams = [...(actualPeer.streams || []), stream];
      if (stream.isVideo) return (actualPeer.video = stream);
      actualPeer.audio = stream;
    });
    const isScreen = (actualPeer.video || actualPeer.screen)
      && producers.filter((p) => p.producerID === actualPeer.video.producerID && p.isScreen).length > 0;
    actualPeers.push({ ...actualPeer, isScreen });
  });

  if (!isGrid && !mainStream && actualPeers.length > 0) {
    setMainStream(actualPeers[actualPeers.length - 1]);
  }

  if (!isGrid && mainStream && actualPeers.length > 0) {
    let mainPeer = mainStream;
    actualPeers.forEach((peer) => peer.socketID === mainPeer && (mainPeer = peer));
    return (
      <div className="streams uk-flex uk-flex-middle uk-flex-center uk-flex-column">
        <div className="video-container">
          <div className="video-row">
            <div className="video-wrapper">
              <Interface
                isMaximized={isMaximized}
                video={mainPeer.video}
                audio={mainPeer.audio}
                peer={mainPeer.user}
                isScreen={mainPeer.isScreen}
              />
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  const side = Math.ceil(Math.sqrt(actualPeers.length));

  const rows = [];
  let row = [];

  actualPeers.forEach((peer, key) => {
    if (row.length === side) {
      rows.push(
        <div className="video-row" key={key}>
          {row}
        </div>,
      );
      row = [];
    }
    console.log('peer', peer);
    if (peer.video) {
      console.log('video', peer.video.getVideoTracks()[0]);
    }
    row.push(
      <div className="video-wrapper" key={key}>
        <Interface
          isMaximized={isMaximized}
          video={peer.video}
          audio={peer.audio}
          peer={peer.user}
          isScreen={peer.isScreen}
        />
      </div>,
    );
  });

  if (row.length > 0) {
    rows.push(
      <div className="video-row" key="last">
        {row}
      </div>,
    );
  }

  return (
    <div className="streams uk-flex uk-flex-middle uk-flex-center uk-flex-column">
      {actualPeers.length === 0 && <p className="waiting">Waiting for others to join...</p>}
      {actualPeers.length > 0 && <div className="video-container">{rows}</div>}
      {children}
    </div>
  );
}

export default Streams;
