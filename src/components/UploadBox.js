import React, { useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';

const UploadBox = ({ onFileUploaded }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null);

  const handleFileChange = (event, fileType) => {
    const file = event.target.files[0];
    if (file) {
      onFileUploaded(file, fileType);
      if (fileType === 'pdf') {
        setPdfFile(file);
      } else if (fileType === 'csv') {
        setCsvFile(file);
      }
    }
  };

  const formatFileName = (fileName) => {
    if (!fileName) return 'Upload File';
    const nameWithoutExtension = fileName.slice(0, 6); // Get first 6 letters
    const extension = fileName.split('.').pop(); // Get file extension
    return `${nameWithoutExtension}.${extension}`;
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
      <Button
        variant="contained"
        component="label"
        startIcon={<CloudUploadIcon />}
        style={{ marginRight: '10px' }}
        disabled={!!pdfFile} // Disable if PDF is already uploaded
      >
        {pdfFile ? 'PDF Uploaded' : 'Upload PDF'}
        <input
          type="file"
          accept="application/pdf"
          hidden
          onChange={(e) => handleFileChange(e, 'pdf')}
        />
      </Button>

      <Button
        variant="contained"
        component="label"
        startIcon={<CloudUploadIcon />}
        disabled={!!csvFile} // Disable if CSV is already uploaded
      >
        {csvFile ? 'CSV Uploaded' : 'Upload CSV'}
        <input
          type="file"
          accept=".csv"
          hidden
          onChange={(e) => handleFileChange(e, 'csv')}
        />
      </Button>

      <Box display="flex" alignItems="center" ml={2}>
        {csvFile && (
          <>
            <DescriptionIcon style={{ marginRight: '8px' }} />
            <Typography variant="body1" style={{ color: '#fff' }}>
              {formatFileName(csvFile.name)}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

export default UploadBox;
