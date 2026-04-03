function ChildAvatar({ avatar, name, size = 'sm' }) {
  const isPhoto = avatar && !avatar.match(/[\u{1F000}-\u{1FFFF}]/u) && avatar.length > 5;
  const sizeClass = size === 'lg' ? 'child-photo-lg' : 'child-photo-sm';

  if (isPhoto) {
    return <img className={sizeClass} src={avatar} alt={name} />;
  }

  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return <span className={`${sizeClass} child-photo-fallback`}>{initial}</span>;
}

export default ChildAvatar;
