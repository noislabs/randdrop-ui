// TODO: style
const progressBar = ({ percentageLeft }) => {
    return (
      <div className="progress-bar-background" style={{ width: '100%', backgroundColor: '#ddd' }}>
        <div style={{ width: `${percentageLeft}%`, backgroundColor: 'green', height: '20px' }} />
      </div>
    );
};

export default progressBar;