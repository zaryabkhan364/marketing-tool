// src/App.js//
import React, { useEffect, useRef, useState } from 'react';
import UploadBox from './components/UploadBox';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Paper,
  LinearProgress,
  Card,
  CardContent,
  CardHeader,
  CircularProgress, // Added import for CircularProgress
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  setPhoneLinks,
  addClickedNumber,
  setIsRunning,
  setError,
  setLoading,
  reset,
} from './store/appSlice';
import './App.css'; // Import custom CSS
import WhatsAppLogo from './assets/whatsapp-logo1.png'; // Ensure you have this logo in the specified path

const App = () => {
  const dispatch = useDispatch();
  const { phoneLinks, clickedNumbers, error, loading, isRunning } = useSelector(
    (state) => state.app
  );

  // Refs to hold mutable values without causing re-renders
  const clickQueueRef = useRef([]);
  const currentIndexRef = useRef(0);
  const timerRef = useRef(null);

  // Local state for managing pause/resume
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(isPaused);

  // Audio refs
  const successAudioRef = useRef(null);
  const errorAudioRef = useRef(null);

  // Initialize audio on component mount
  useEffect(() => {
    successAudioRef.current = new Audio('/assets/success.mp3'); // Ensure these files exist
    errorAudioRef.current = new Audio('/assets/error.mp3'); // Ensure these files exist
  }, []);

  // Update isPausedRef whenever isPaused changes
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Handle file upload and parsing
  const handleFileUploaded = async (file) => {
    const fileType = file.type;
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const arrayBuffer = await file.arrayBuffer();

      if (fileType === 'application/pdf') {
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let textContent = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContentPage = await page.getTextContent();
          const textItems = textContentPage.items.map((item) => item.str);
          textContent += textItems.join(' ') + '\n';
        }

        parseText(textContent);
      } else if (fileType === 'text/csv') {
        const textContent = new TextDecoder('utf-8').decode(arrayBuffer);
        parseCsv(textContent);
      } else {
        throw new Error('Unsupported file format');
      }
    } catch (err) {
      console.error(err);
      dispatch(
        setError('Failed to parse file. Please ensure the file is correctly formatted.')
      );
      if (errorAudioRef.current) errorAudioRef.current.play(); // Play error sound
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Parse CSV content
  const parseCsv = (text) => {
    const lines = text.split('\n').filter((line) => line.trim() !== '');
    const phoneLinkPairs = lines
      .map((line) => {
        const parts = line.split(',');
        const phone = parts[0]?.trim();
        const link = parts[1]?.trim();

        const phoneValid = /^\+?\d{10,15}$/.test(phone);
        const linkValid = /^https?:\/\/[^\s$.?#].[^\s]*$/.test(link);

        if (phoneValid && linkValid) {
          return { phone, link };
        } else {
          return null;
        }
      })
      .filter((item) => item !== null);

    if (phoneLinkPairs.length === 0) {
      dispatch(setError('No valid phone numbers and links found in the CSV.'));
      if (errorAudioRef.current) errorAudioRef.current.play(); // Play error sound
    } else {
      dispatch(setPhoneLinks(phoneLinkPairs));
    }
  };

  // Parse PDF text content
  const parseText = (text) => {
    const lines = text.split('\n').filter((line) => line.trim() !== '');
    const phoneLinkPairs = lines
      .map((line) => {
        const parts = line.split(/\s{2,}/);
        const phone = parts[0]?.trim();
        const link = parts[1]?.trim();

        const phoneValid = /^\+?\d{10,15}$/.test(phone);
        const linkValid = /^https?:\/\/[^\s$.?#].[^\s]*$/.test(link);

        if (phoneValid && linkValid) {
          return { phone, link };
        } else {
          return null;
        }
      })
      .filter((item) => item !== null);

    if (phoneLinkPairs.length === 0) {
      dispatch(setError('No valid phone numbers and links found in the PDF.'));
      if (errorAudioRef.current) errorAudioRef.current.play(); // Play error sound
    } else {
      dispatch(setPhoneLinks(phoneLinkPairs));
    }
  };

  // Start or Resume the clicking process
  const handleStart = () => {
    if (phoneLinks.length === 0) {
      dispatch(setError('No phone links to click. Please upload a valid PDF or CSV.'));
      if (errorAudioRef.current) errorAudioRef.current.play(); // Play error sound
      return;
    }

    if (!isRunning && !isPaused) {
      // Start fresh
      dispatch(reset());

      const shuffledLinks = [...phoneLinks].sort(() => Math.random() - 0.5);
      clickQueueRef.current = shuffledLinks;
      currentIndexRef.current = 0;
      dispatch(setIsRunning(true));
      setIsPaused(false);
    } else if (!isRunning && isPaused) {
      // Resume
      dispatch(setIsRunning(true));
      setIsPaused(false);
    }
  };

  // Execute clicking on the current link
  const executeClicks = () => {
    // Check if all links have been clicked
    if (currentIndexRef.current >= clickQueueRef.current.length) {
      dispatch(setIsRunning(false));
      if (successAudioRef.current) successAudioRef.current.play(); // Play success sound
      return;
    }

    // If paused, do not proceed
    if (isPausedRef.current) return;

    const { phone, link } = clickQueueRef.current[currentIndexRef.current];

    // Validate URL before opening
    if (/^https?:\/\/[^\s$.?#].[^\s]*$/.test(link)) {
      try {
        // Open link in a new tab
        window.open(link, '_blank');
        dispatch(addClickedNumber(phone)); // Record the clicked number
      } catch (err) {
        console.error(`Failed to open link for ${phone}: ${link}`);
        dispatch(setError(`Failed to open link for ${phone}.`));
        if (errorAudioRef.current) errorAudioRef.current.play(); // Play error sound
      }
    } else {
      console.warn(`Invalid URL for ${phone}: ${link}`);
      dispatch(setError(`Invalid URL for ${phone}.`));
      if (errorAudioRef.current) errorAudioRef.current.play(); // Play error sound
    }

    currentIndexRef.current += 1; // Move to the next link

    // Schedule the next click after 5 seconds
    timerRef.current = setTimeout(() => {
      executeClicks();
    }, 5000);
  };

  // Stop (Pause) the clicking process
  const handleStop = () => {
    if (!isRunning) return; // Do nothing if not running

    setIsPaused(true); // Update pause state
    dispatch(setIsRunning(false)); // Update running state
    clearTimeout(timerRef.current); // Clear the scheduled click
  };

  // Reset the clicking process
  const handleReset = () => {
    clearTimeout(timerRef.current);
    dispatch(reset()); // Resets clickedNumbers, isRunning, error, loading
    clickQueueRef.current = [];
    currentIndexRef.current = 0;
    setIsPaused(false); // Reset pause state
    dispatch(setIsRunning(false)); // Ensure the process is marked as not running
  };

  // useEffect to handle clicking when isRunning changes
  useEffect(() => {
    if (isRunning) {
      executeClicks();
    } else {
      clearTimeout(timerRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  useEffect(() => {
    // Cleanup on component unmount
    return () => clearTimeout(timerRef.current);
  }, []);

  // Calculate progress percentage
  const progressPercentage = phoneLinks.length
    ? (currentIndexRef.current / phoneLinks.length) * 100
    : 0;

  // Get current link details
  const currentLink =
    clickQueueRef.current.length > 0 && currentIndexRef.current < clickQueueRef.current.length
      ? clickQueueRef.current[currentIndexRef.current]
      : null;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #a2c2e1, #f0f8ff)', // Light bluish gradient
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '20px',
        color: '#333',
        fontFamily: "'Poppins', sans-serif", // Smooth font
      }}
    >
      <Container maxWidth="md">
        <Grid container spacing={4} justifyContent="center">
          {/* Heading with WhatsApp Logo and Title */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" justifyContent="center">
              <img
                src={WhatsAppLogo} // Ensure this path is correct
                alt="WhatsApp Logo"
                style={{ width: '50px', height: '50px', marginRight: '10px', marginBottom: '14px' }}
              />
              <Typography
                variant="h4"
                align="center"
                gutterBottom
                style={{
                  fontWeight: 600, // Boldness
                  letterSpacing: '0.5px',
                  color: '#333',
                }}
              >
                WhatsApp Marketing
              </Typography>
            </Box>
          </Grid>

          {/* Upload Section */}
          <Grid item xs={12}>
            <UploadBox onFileUploaded={handleFileUploaded} />
          </Grid>

          {/* Control Buttons */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
              {/* Start Button */}
              <Button
                variant="contained"
                onClick={handleStart}
                style={{
                  marginRight: '10px',
                  backgroundColor: '#25D366', // WhatsApp green color
                  color: '#fff',
                }}
                disabled={loading || isRunning}
              >
                Start
              </Button>

              {/* Stop Button */}
              <Button
                variant="contained"
                onClick={handleStop}
                style={{
                  marginRight: '10px',
                  backgroundColor: '#ffcc00', // Yellow color for stop
                  color: '#fff',
                }}
                disabled={!isRunning}
              >
                Stop
              </Button>

              {/* Reset Button */}
              <Button
                variant="contained"
                onClick={handleReset}
                style={{
                  backgroundColor: '#f44336', // Red color for reset
                  color: '#fff',
                }}
                disabled={!isRunning && !isPaused}
              >
                Reset
              </Button>
            </Box>
          </Grid>

          {/* Progress Indicator */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="body1" gutterBottom>
                Progress: {currentIndexRef.current} / {phoneLinks.length}
              </Typography>
              <LinearProgress variant="determinate" value={progressPercentage} />
            </Box>
          </Grid>

          {/* Current Link Display */}
          <Grid item xs={12}>
            {currentLink && (
              <Card variant="outlined" style={{ backgroundColor: '#f9f9f9' }}>
                <CardHeader title="Currently Clicking" />
                <CardContent>
                  <Typography variant="body1">
                    <strong>Phone:</strong> {currentLink.phone}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Link:</strong>{' '}
                    <a href={currentLink.link} target="_blank" rel="noopener noreferrer">
                      {currentLink.link}
                    </a>
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Clicked Numbers Section */}
          <Grid item xs={12}>
            <Paper
              style={{
                padding: '10px',
                maxHeight: '200px',
                overflowY: 'auto',
                backgroundColor: '#ffffff',
              }}
              elevation={3}
            >
              <Typography variant="h6" gutterBottom>
                Clicked Numbers
              </Typography>
              {clickedNumbers.length > 0 ? (
                clickedNumbers.map((number, index) => (
                  <Typography key={index} variant="body1">
                    {number}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No numbers clicked yet.
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Feedback/Error Messages */}
          <Grid item xs={12}>
            {error && (
              <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => dispatch(setError(null))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              >
                <Alert
                  severity="error"
                  onClose={() => dispatch(setError(null))}
                  variant="filled"
                >
                  {error}
                </Alert>
              </Snackbar>
            )}
          </Grid>

          {/* Loading Indicator */}
          {loading && (
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" alignItems="center">
                <Typography variant="body1" style={{ marginRight: '10px' }}>
                  Loading...
                </Typography>
                <CircularProgress size={24} /> {/* CircularProgress Component */}
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </div>
  );
};

export default App;
