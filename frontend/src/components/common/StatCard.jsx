function StatCard({ label, value, description, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span>{label}</span>

        <div className="stat-icon">
          <Icon size={17} />
        </div>
      </div>

      <strong>{value}</strong>

      <p>{description}</p>
    </div>
  );
}

export default StatCard;