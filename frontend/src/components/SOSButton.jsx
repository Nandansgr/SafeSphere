import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";
import { sosAPI } from "../services/api";
import toast from "react-hot-toast";

const SOSButton = () => {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState("Emergency SOS Alert! I need immediate assistance.");

  const handleSOS = async () => {
    setLoading(true);
    try {
      let latitude = null;
      let longitude = null;
      let address = "Location unavailable";

      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true,
            });
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        } catch (geoError) {
          console.warn("Geolocation unavailable:", geoError);
        }
      }

      await sosAPI.create({ latitude, longitude, address, message, alert_type: "manual" });

      toast.success("SOS Alert sent! Help is on the way.", {
        duration: 5000,
        style: { background: "#dc2626", color: "#fff", fontWeight: 600, fontSize: "0.85rem" },
      });

      setConfirmOpen(false);
      setMessage("Emergency SOS Alert! I need immediate assistance.");
    } catch (error) {
      toast.error("Failed to send SOS alert. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
        <Button
          variant="contained"
          onClick={() => setConfirmOpen(true)}
          sx={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            bgcolor: "error.main",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: 800,
            letterSpacing: 1,
            boxShadow: "0 0 25px rgba(239, 68, 68, 0.4)",
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.6)" },
              "70%": { boxShadow: "0 0 0 15px rgba(239, 68, 68, 0)" },
              "100%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0)" },
            },
            "&:hover": {
              bgcolor: "error.dark",
              transform: "scale(1.05)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <WarningIcon sx={{ fontSize: 32, mb: 0.3 }} />
            SOS
          </Box>
        </Button>
        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: "0.75rem" }}>
          Press for Emergency SOS
        </Typography>
      </Box>

      <Dialog
        open={confirmOpen}
        onClose={() => !loading && setConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: "error.main", fontSize: "1rem" }}>
          Confirm SOS Alert
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: "0.8rem" }}>
            This will send an emergency SOS alert with your current location. Are you sure?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Emergency Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button onClick={() => setConfirmOpen(false)} disabled={loading} variant="outlined" size="small">
            Cancel
          </Button>
          <Button
            onClick={handleSOS}
            disabled={loading}
            variant="contained"
            color="error"
            size="small"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <WarningIcon />}
          >
            {loading ? "Sending..." : "Send SOS"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SOSButton;
