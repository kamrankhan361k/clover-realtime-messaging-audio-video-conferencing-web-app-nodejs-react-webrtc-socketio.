import moment from 'moment';
import './Message.sass';
import emojiRegex from 'emoji-regex';
import { useGlobal } from 'reactn';
import ReactImageAppear from 'react-image-appear';
import { FiDownloadCloud } from 'react-icons/fi';
import striptags from 'striptags';
import Config from '../../../config';

function Message({
  message, previous, next, onOpen,
}) {
  const { content, date } = message;
  let { author } = message;

  const user = useGlobal('user')[0];

  if (!author) author = { firstName: 'Deleted', lastName: 'User' };
  if (previous && !previous.author) previous.author = { firstName: 'Deleted', lastName: 'User' };
  if (next && !next.author) next.author = { firstName: 'Deleted', lastName: 'User' };

  const isMine = user.id === author._id;

  let attachPrevious = false;
  let attachNext = false;

  if (
    previous
    && Math.abs(moment(previous.date).diff(moment(date), 'minutes')) < 3
    && author._id === previous.author._id
  ) attachPrevious = true;
  if (next && Math.abs(moment(next.date).diff(moment(date), 'minutes')) < 3 && author._id === next.author._id) attachNext = true;

  function Picture({ user }) {
    if (user.picture) return <img src={`${Config.url || ''}/api/images/${user.picture.shieldedID}/256`} alt="Picture" />;
    return (
      <div className="img">
        {user.firstName.substr(0, 1)}
        {user.lastName.substr(0, 1)}
      </div>
    );
  }

  function Details({ side }) {
    if (!attachNext) {
      return <div className={`message-details ${side}`}>{moment(date).format('MMM DD - h:mm A')}</div>;
    }
    return null;
  }

  function PictureOrSpacer() {
    if (attachPrevious) return <div className="spacer" />;
    return (
      <div className="picture">
        <Picture user={author} />
      </div>
    );
  }

  const noEmoji = content.replace(emojiRegex(), '');
  const isOnlyEmoji = !noEmoji.replace(/[\s\n]/gm, '');

  const getBubble = () => {
    if (attachPrevious || isOnlyEmoji) {
      if (isMine) return ' right';
      return ' left';
    }
    if (isMine) return ' bubble-right right';
    return ' bubble-left left';
  };

  const convertUrls = (text) => {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank">${url}</a>`;
    });
  };

  function Content() {
    switch (message.type) {
      case 'image':
        return (
          <ReactImageAppear
            src={`${Config.url || ''}/api/images/${message.content}/512`}
            animationDuration="0.2s"
            onClick={() => onOpen(message)}
          />
        );
      case 'file':
        return (
          <a
            href={`${Config.url || ''}/api/files/${message.content}`}
            download={message.file ? message.file.name : 'File'}
          >
            <div className="content-download">
              <div className="content-file">
                <div className="content-name">{message.file ? message.file.name : 'File'}</div>
                <div className="content-size">
                  {message.file ? `${Math.round((message.file.size / 1024 / 1024) * 10) / 10} MB` : 'Size'}
                </div>
              </div>
              <div className="content-icon">
                <FiDownloadCloud />
              </div>
            </div>
          </a>
        );
      default:
        // eslint-disable-next-line react/no-danger
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: convertUrls(striptags(content, ['a', 'strong', 'b', 'i', 'em', 'u', 'br'])),
            }}
          />
        );
    }
  }

  const getBubbleClass = () => {
    if (message.type === 'image') return 'bubble-image';
    return isOnlyEmoji ? 'emoji-bubble' : 'bubble';
  };

  return (
    <div
      className={`message${isMine ? ' right' : ' left'}${attachPrevious ? ' attach-previous' : ''}${
        attachNext ? ' attach-next' : ''
      }`}
    >
      <PictureOrSpacer />
      <div
        className={`content-x${isMine ? ' right' : ''}${attachPrevious ? ' attach-previous' : ''}${
          attachNext ? ' attach-next' : ''
        }`}
      >
        <div
          className={`${getBubbleClass()}${getBubble()}${attachPrevious ? ' attach-previous' : ''}${
            attachNext ? ' attach-next' : ''
          }`}
        >
          <Content />
        </div>
        <Details side={isMine ? 'right' : 'left'} />
      </div>
    </div>
  );
}

export default Message;
