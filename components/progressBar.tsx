import ProgressBar from 'react-bootstrap/ProgressBar';

const Progress = ({ percentageLeft }) => {
  return (
    <div style={{ marginBottom: '20px', width: '100%' }}>
      <ProgressBar
        className="custom-progress-bar" // Add the custom CSS class to the ProgressBar
        striped
        animated
        now={percentageLeft}
        label={`${percentageLeft}%`}
        style={{
          height: '30px', // Increase height to make it taller
          fontSize: '14px', // Adjust font size
          fontWeight: 'bold' // Make the text bold
        }}
      />
    </div>
  );
};

export default Progress;