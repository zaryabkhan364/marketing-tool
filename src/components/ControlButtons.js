// src/components/ControlButtons.js
import React from 'react';
import Button from '@mui/material/Button';
import { Grow } from '@mui/material';

const ControlButtons = ({
  onStart,
  onStop,
  onRestart,
  onPause,
  onResume,
  timer,
  isRunning,
  isPaused,
}) => {
  return (
    <Grow in={true} timeout={600}>
      <div
        style={{
          marginTop: '20px',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        {!isRunning && (
          <Button
            variant="contained"
            color="primary"
            onClick={onStart}
            style={{ marginRight: '10px' }}
          >
            Start Clicking ({timer}s)
          </Button>
        )}
        {isRunning && !isPaused && (
          <Button
            variant="contained"
            color="warning"
            onClick={onPause}
            style={{ marginRight: '10px' }}
          >
            Pause
          </Button>
        )}
        {isRunning && isPaused && (
          <Button
            variant="contained"
            color="info"
            onClick={onResume}
            style={{ marginRight: '10px' }}
          >
            Resume
          </Button>
        )}
        <Button
          variant="contained"
          color="secondary"
          onClick={onStop}
          disabled={!isRunning}
          style={{ marginRight: '10px' }}
        >
          Stop Clicking
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={onRestart}
          disabled={isRunning}
        >
          Restart Clicking
        </Button>
      </div>
    </Grow>
  );
};

export default ControlButtons;
