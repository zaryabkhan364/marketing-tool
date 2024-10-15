// src/components/ClickedList.js
import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText } from '@mui/material';

const ClickedList = ({ clickedNumbers }) => {
  return (
    <Paper
      elevation={3}
      style={{
        padding: '20px',
        borderRadius: '10px',
        background: 'rgba(255, 255, 255, 0.1)',
        color: '#fff',
        maxHeight: '200px',
        overflowY: 'auto',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Clicked Numbers:
      </Typography>
      <List>
        {clickedNumbers.map((number, index) => (
          <ListItem key={index} style={{ padding: '5px 0' }}>
            <ListItemText primary={number} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default ClickedList;
