import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { PDFDocument } from 'pdf-lib';

const FileUpload = () => {
  const [fileData, setFileData] = useState(null);
  const [extractedData, setExtractedData] = useState([]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const fileContent = await file.arrayBuffer();
      extractDataFromPDF(fileContent);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const extractDataFromPDF = async (fileContent) => {
    const pdfDoc = await PDFDocument.load(fileContent);
    const text = await pdfDoc.getPage(0).getTextContent();

    const phoneNumbers = [];
    const links = [];

    // This part assumes two columns of data, you may need to adjust how you extract the data
    text.items.forEach((item) => {
      const itemText = item.str;
      // Add your logic to separate phone numbers and links based on your PDF's structure
      // Here we're assuming phone numbers and links are separated by a specific pattern
      const [phone, link] = itemText.split(' '); // Adjust this line based on your data format
      if (phone && link) {
        phoneNumbers.push(phone);
        links.push(link);
      }
    });

    // Update the state with extracted data
    setExtractedData(phoneNumbers.map((phone, index) => ({ phone, link: links[index] })));
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      background: 'linear-gradient(to right, #6a11cb, #2575fc)' 
    }}>
      <Typography variant="h4" color="white">Upload PDF Links</Typography>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        style={{ margin: '20px 0' }}
      />
      {extractedData.length > 0 && (
        <Box sx={{ marginTop: '20px', backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
          <Typography variant="h6">Extracted Data:</Typography>
          {extractedData.map((data, index) => (
            <Typography key={index}>
              {data.phone} - <a href={data.link} target="_blank" rel="noopener noreferrer">{data.link}</a>
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
