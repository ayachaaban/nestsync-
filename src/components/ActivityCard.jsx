const typeConfig = {
  meal: { icon: '', color: '#f59e0b', bg: '#fef3c7' },
  nap: { icon: '', color: '#6366f1', bg: '#e0e7ff' },
  diaper: { icon: '', color: '#14b8a6', bg: '#ccfbf1' },
  activity: { icon: '', color: '#ec4899', bg: '#fce7f3' },
  health: { icon: '', color: '#ef4444', bg: '#fee2e2' },
};

function ActivityCard({ activity }) {
  const config = typeConfig[activity.type] || typeConfig.activity;

  return (
    <div className="activity-card">
      <div className="activity-icon" style={{ background: config.bg, color: config.color }}>
        {config.icon}
      </div>
      <div className="activity-content">
        <div className="activity-header">
          <h4>{activity.title}</h4>
          <span className="activity-time">{activity.time}</span>
        </div>
        <p>{activity.description}</p>
        <span className="activity-staff">by {activity.staffName}</span>
      </div>
    </div>
  );
}

export default ActivityCard;
