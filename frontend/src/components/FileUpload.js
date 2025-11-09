import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Paper,
  Alert
} from '@mui/material';
import {
  AttachFile,
  Delete,
  CloudUpload
} from '@mui/icons-material';

function FileUpload({ onFilesChange, maxFiles = 10, maxSizeMB = 50 }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setError('');

    // Validate file count
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file sizes
    const oversizedFiles = selectedFiles.filter(
      file => file.size > maxSizeMB * 1024 * 1024
    );
    
    if (oversizedFiles.length > 0) {
      setError(`Files must be smaller than ${maxSizeMB}MB`);
      return;
    }

    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);
    onFilesChange(newFiles); // Pass actual File objects, not processed data

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    handleFileSelect({ target: { files: droppedFiles } });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Paper
        variant="outlined"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{
          p: 3,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: 'primary.main',
          backgroundColor: 'action.hover',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'action.selected',
          }
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          Drag & Drop Files Here
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          or click to select files
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Maximum {maxFiles} files, {maxSizeMB}MB each
        </Typography>

        <input
          type="file"
          ref={fileInputRef}
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Selected Files ({files.length})
          </Typography>
          <List>
            {files.map((file, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveFile(index)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <AttachFile />
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={formatFileSize(file.size)}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}

export default FileUpload;