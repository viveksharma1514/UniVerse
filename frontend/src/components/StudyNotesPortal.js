import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  Upload,
  PictureAsPdf,
  Image,
  Code,
  Description,
  Delete,
  Visibility,
  Download,
  NoteAdd,
} from "@mui/icons-material";
import { API_URL } from "../config";

const StudyNotesPortal = ({ user }) => {
  const [notes, setNotes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDescription, setNoteDescription] = useState("");
  const [noteFiles, setNoteFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/notes/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleFileChange = (e) => setNoteFiles(Array.from(e.target.files));

  const handleUpload = async () => {
    if (!noteTitle || noteFiles.length === 0) {
      alert("Please provide a title and at least one file.");
      return;
    }
    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", noteTitle);
      formData.append("description", noteDescription);
      noteFiles.forEach((file) => formData.append("files", file));

      const response = await fetch(`${API_URL}/api/notes/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      setOpenDialog(false);
      setNoteTitle("");
      setNoteDescription("");
      setNoteFiles([]);
      fetchNotes();
    } catch (err) {
      console.error(err);
      alert("Error uploading note");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/files/download/notes/${file.filename}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.originalName || file.filename;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const handlePreview = (file) => {
    const token = localStorage.getItem("token");
    const url = `${API_URL}/api/files/preview/notes/${file.filename}?token=${token}`;
    window.open(url, "_blank");
  };

  const handleDelete = async (id, uploaderId) => {
    if (user.id !== uploaderId) {
      alert("You can only delete your own uploaded notes.");
      return;
    }
    if (!window.confirm("Delete this note permanently?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotes();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const getFileIcon = (type) => {
    if (type === "application/pdf") return <PictureAsPdf color="error" />;
    if (type?.startsWith("image/")) return <Image color="primary" />;
    if (type?.includes("text") || type?.includes("code")) return <Code color="info" />;
    return <Description color="action" />;
  };

  if (loading)
    return (
      <Box textAlign="center" py={10}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            📘 Study Notes Portal
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Upload and explore study notes shared by other students
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<NoteAdd />}
          onClick={() => setOpenDialog(true)}
          sx={{
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "white",
            "&:hover": { background: "rgba(255,255,255,0.3)" },
          }}
        >
          Upload Notes
        </Button>
      </Paper>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center", borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">
            No notes uploaded yet. Be the first to share knowledge! ✨
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {notes.map((note) => (
            <Grid item xs={12} sm={6} md={4} key={note._id}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  transition: "0.3s",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: 4 },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Avatar sx={{ bgcolor: "#667eea", mr: 1 }}>
                    {note.uploader?.name?.charAt(0) || "S"}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {note.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      by {note.uploader?.name || "Anonymous"}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {note.description || "No description"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Uploaded on {new Date(note.createdAt).toLocaleDateString()}
                </Typography>

                <Box sx={{ mt: 1.5 }}>
                  {note.files?.map((file, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1,
                        borderRadius: 2,
                        bgcolor: "rgba(240,240,255,0.5)",
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {getFileIcon(file.mimetype)}
                        <Typography variant="body2">{file.originalName || file.filename}</Typography>
                      </Box>
                      <Box>
                        <Tooltip title="Preview">
                          <IconButton onClick={() => handlePreview(file)}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton onClick={() => handleDownload(file)}>
                            <Download />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {user.id === note.uploader?._id && (
                  <Box textAlign="right">
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDelete(note._id, note.uploader?._id)}
                    >
                      Delete
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Upload Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            fontWeight: 600,
          }}
        >
          Upload Study Notes
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Title"
              fullWidth
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
            />
            <TextField
              label="Description (optional)"
              multiline
              rows={3}
              value={noteDescription}
              onChange={(e) => setNoteDescription(e.target.value)}
            />
            <Button variant="outlined" component="label" startIcon={<Upload />}>
              Choose Files
              <input type="file" hidden multiple onChange={handleFileChange} />
            </Button>
            {noteFiles.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                {noteFiles.length} file(s) selected
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            {uploading ? <CircularProgress size={22} color="inherit" /> : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudyNotesPortal;
