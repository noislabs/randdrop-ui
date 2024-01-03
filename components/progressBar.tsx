import ProgressBar from 'react-bootstrap/ProgressBar';

const Progress = ({ percentageLeft }) => {
  return (
    <div style={{marginBottom: '20px'}}>
      <ProgressBar striped animated now={percentageLeft} label={`${percentageLeft}%`} style={{color: 'black'}}/>
    </div>
  );
};

export default Progress;