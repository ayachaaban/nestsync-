import ChildAvatar from './ChildAvatar';

function ChildSelector({ children, selectedId, onSelect }) {
  return (
    <div className="child-selector">
      {children.map((child) => (
        <button
          key={child.id}
          className={`child-chip ${selectedId === child.id ? 'active' : ''}`}
          onClick={() => onSelect(child.id)}
        >
          <ChildAvatar avatar={child.avatar} name={child.name} size="sm" />
          <span>{child.name}</span>
        </button>
      ))}
    </div>
  );
}

export default ChildSelector;
