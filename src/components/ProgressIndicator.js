// src/components/ProgressIndicator.js
import React from 'react';
import { LinearProgress, Typography, Box } from '@mui/material';

const ProgressIndicator = ({ clicked, total }) => {
  const progress = total === 0 ? 0 : (clicked / total) * 100;

  return (
    <Box sx={{ width: '100%', marginTop: '20px' }}>
      <Typography variant="body1" gutterBottom>
        Progress: {clicked} / {total} clicked
      </Typography>
      <LinearProgress variant="determinate" value={progress} />
    </Box>
  );
};

export default ProgressIndicator;
