function StatsCard({ icon, label, value, color }) {
  return (
    <div className="stats-card">
      <div className="stats-icon" style={{ background: color + '20', color }}>
        {icon}
      </div>
      <div className="stats-info">
        <span className="stats-value">{value}</span>
        <span className="stats-label">{label}</span>
      </div>
    </div>
  );
}

export default StatsCard;
