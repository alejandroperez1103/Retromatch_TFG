import './StatusAlert.css';

const StatusAlert = ({ message, type = 'info' }) => {
  if (!message) {
    return null;
  }

  return (
    <div className={`status-alert ${type}`} role="alert">
      {message}
    </div>
  );
};

export default StatusAlert;
