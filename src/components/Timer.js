// src/components/Timer.js
import React from 'react';
import { Typography, Fade } from '@mui/material';

const Timer = ({ timeLeft }) => {
  return (
    <Fade in={true} timeout={500}>
      <div style={{ fontSize: '24px', marginTop: '10px', color: '#fff' }}>
        Timer: {timeLeft}s
      </div>
    </Fade>
  );
};

export default Timer;
