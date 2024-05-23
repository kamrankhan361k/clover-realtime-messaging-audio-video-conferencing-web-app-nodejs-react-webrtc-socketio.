import Config from '../config';

function Picture({
  user = {}, group = false, picture, title = 'Group',
}) {
  if (group) {
    if (picture) return <img src={`${Config.url || ''}/api/images/${picture.shieldedID}/256`} alt="Picture" className="picture" />;
    return <div className="img">{title.substr(0, 1).toUpperCase()}</div>;
  }

  const firstName = user.firstName || 'User';
  const lastName = user.lastName || 'Name';
  if (user.picture) {
    return (
      <img src={`${Config.url || ''}/api/images/${user.picture.shieldedID}/256`} alt="Picture" className="picture" />
    );
  }
  return (
    <div className="img">
      {firstName.substr(0, 1).toUpperCase()}
      {lastName.substr(0, 1).toUpperCase()}
    </div>
  );
}

export default Picture;
