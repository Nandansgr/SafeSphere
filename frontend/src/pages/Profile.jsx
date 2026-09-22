import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Card, CardContent, Grid, TextField, Button, Avatar, IconButton, CircularProgress } from "@mui/material";
import { CameraAlt as CameraIcon, Save as SaveIcon, LockReset as LockResetIcon } from "@mui/icons-material";
import { profileAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Loading from "../components/Loading";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileForm, setProfileForm] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "", confirm_password: "" });

  useEffect(() => {
    if (user) { setProfileForm({ first_name: user.first_name || "", last_name: user.last_name || "", email: user.email || "", phone: user.phone || "" }); setLoading(false); }
  }, [user]);

  const handleProfileUpdate = async () => {
    setSaving(true);
    try { await profileAPI.updateProfile(profileForm); await refreshUser(); toast.success("Profile updated"); }
    catch (error) { toast.error(typeof error.response?.data?.detail === "string" ? error.response.data.detail : "Failed to update"); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new_password.length < 8) { toast.error("Min 8 characters"); return; }
    if (passwordForm.new_password !== passwordForm.confirm_password) { toast.error("Passwords don't match"); return; }
    setChangingPassword(true);
    try { await profileAPI.updatePassword({ current_password: passwordForm.current_password, new_password: passwordForm.new_password }); toast.success("Password changed"); setPasswordForm({ current_password: "", new_password: "", confirm_password: "" }); }
    catch (error) { toast.error(typeof error.response?.data?.detail === "string" ? error.response.data.detail : "Failed"); }
    finally { setChangingPassword(false); }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { toast.error("Only JPEG/PNG/WebP allowed"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setUploading(true);
    try { const fd = new FormData(); fd.append("file", file); await profileAPI.uploadPicture(fd); await refreshUser(); toast.success("Picture updated"); }
    catch (error) { toast.error("Failed to upload"); }
    finally { setUploading(false); }
  };

  if (loading) return <Loading message="Loading profile..." />;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Profile Settings</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2.5 }}>
              <Box sx={{ position: "relative", display: "inline-block", mb: 1.5 }}>
                <Avatar src={user?.profile_picture} sx={{ width: 90, height: 90, fontSize: "2rem", bgcolor: "primary.main" }}>
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </Avatar>
                <IconButton sx={{ position: "absolute", bottom: 0, right: 0, bgcolor: "primary.main", color: "#fff", p: 0.5, "&:hover": { bgcolor: "primary.dark" } }}
                  size="small" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? <CircularProgress size={14} color="inherit" /> : <CameraIcon sx={{ fontSize: 14 }} />}
                </IconButton>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePictureUpload} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600}>{user?.first_name} {user?.last_name}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>Since {new Date(user?.created_at).toLocaleDateString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Personal Information</Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={6}><TextField fullWidth size="small" label="First Name" value={profileForm.first_name} onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })} /></Grid>
                <Grid item xs={6}><TextField fullWidth size="small" label="Last Name" value={profileForm.last_name} onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField fullWidth size="small" label="Email" type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField fullWidth size="small" label="Phone" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} /></Grid>
              </Grid>
              <Button variant="contained" size="small" startIcon={saving ? <CircularProgress size={14} /> : <SaveIcon />}
                onClick={handleProfileUpdate} disabled={saving} sx={{ mt: 1.5, fontSize: "0.78rem" }}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Change Password</Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12}><TextField fullWidth size="small" type="password" label="Current Password" value={passwordForm.current_password} onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} /></Grid>
                <Grid item xs={6}><TextField fullWidth size="small" type="password" label="New Password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} /></Grid>
                <Grid item xs={6}><TextField fullWidth size="small" type="password" label="Confirm" value={passwordForm.confirm_password} onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} /></Grid>
              </Grid>
              <Button variant="outlined" color="warning" size="small" startIcon={changingPassword ? <CircularProgress size={14} /> : <LockResetIcon />}
                onClick={handlePasswordChange} disabled={changingPassword} sx={{ mt: 1.5, fontSize: "0.78rem" }}>
                {changingPassword ? "Changing..." : "Change Password"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
