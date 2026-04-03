function AnnouncementCard({ announcement }) {
  return (
    <div className={`announcement-card ${announcement.priority === 'high' ? 'high-priority' : ''}`}>
      <div className="announcement-header">
        <h4>{announcement.title}</h4>
        {announcement.priority === 'high' && <span className="badge badge-red">Important</span>}
      </div>
      <p>{announcement.message}</p>
      <div className="announcement-footer">
        <span>{announcement.author}</span>
        <span>{announcement.date}</span>
      </div>
    </div>
  );
}

export default AnnouncementCard;
