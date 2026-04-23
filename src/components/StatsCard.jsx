function StatsCard({ icon, label, value, color }) {
  return (
    <div className="stats-card" style={{ background: color + '30' }}>
      <div className="stats-icon">
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
