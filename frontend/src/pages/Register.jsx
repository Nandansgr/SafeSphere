import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Card, CardContent, TextField, Button, Typography, Link, Alert, InputAdornment, IconButton, CircularProgress, Grid } from "@mui/material";
import { Visibility, VisibilityOff, Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon, Lock as LockIcon, Shield as ShieldIcon } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", password: "", confirm_password: "" });

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };

  const validate = () => {
    if (form.password.length < 8) { setError("Password min 8 characters"); return false; }
    if (form.password !== form.confirm_password) { setError("Passwords don't match"); return false; }
    if (form.phone.length < 10) { setError("Phone min 10 digits"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!validate()) return; setLoading(true); setError("");
    try { await register(form); toast.success("Account created!"); navigate("/dashboard"); }
    catch (err) {
      const d = err.response?.data?.detail;
      const msg = Array.isArray(d) ? d.map((e) => e.msg || String(e)).join(", ") : (typeof d === "string" ? d : "Registration failed.");
      setError(msg);
    }
    finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: (t) => t.palette.mode === "dark" ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" : "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #f1f5f9 100%)", p: 2 }}>
      <Card sx={{ maxWidth: 460, width: "100%", p: 2.5, backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
        <CardContent>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Box sx={{ width: 52, height: 52, borderRadius: 2, bgcolor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
              <ShieldIcon sx={{ fontSize: 28, color: "#fff" }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>Create Account</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>Join Safety Alert System</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2, py: 0 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={1.5}>
              <Grid item xs={6}><TextField fullWidth size="small" name="first_name" label="First Name" value={form.first_name} onChange={handleChange} required
                InputProps={{ startAdornment: (<InputAdornment position="start"><PersonIcon color="action" fontSize="small" /></InputAdornment>) }} /></Grid>
              <Grid item xs={6}><TextField fullWidth size="small" name="last_name" label="Last Name" value={form.last_name} onChange={handleChange} required /></Grid>
            </Grid>
            <TextField fullWidth size="small" name="email" label="Email" type="email" value={form.email} onChange={handleChange} required sx={{ mt: 1.5 }}
              InputProps={{ startAdornment: (<InputAdornment position="start"><EmailIcon color="action" fontSize="small" /></InputAdornment>) }} />
            <TextField fullWidth size="small" name="phone" label="Phone" value={form.phone} onChange={handleChange} required sx={{ mt: 1.5 }}
              InputProps={{ startAdornment: (<InputAdornment position="start"><PhoneIcon color="action" fontSize="small" /></InputAdornment>) }} />
            <TextField fullWidth size="small" name="password" label="Password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} required sx={{ mt: 1.5 }}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><LockIcon color="action" fontSize="small" /></InputAdornment>),
                endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment>),
              }} />
            <TextField fullWidth size="small" name="confirm_password" label="Confirm Password" type={showPassword ? "text" : "password"} value={form.confirm_password} onChange={handleChange} required sx={{ mt: 1.5, mb: 2 }}
              InputProps={{ startAdornment: (<InputAdornment position="start"><LockIcon color="action" fontSize="small" /></InputAdornment>) }} />
            <Button fullWidth type="submit" variant="contained" disabled={loading} sx={{ py: 1, fontSize: "0.85rem", fontWeight: 600, background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", "&:hover": { background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)" } }}>
              {loading ? <CircularProgress size={20} color="inherit" /> : "Create Account"}
            </Button>
            <Typography variant="body2" textAlign="center" sx={{ mt: 2, color: "text.secondary" }}>
              Already have an account? <Link component={RouterLink} to="/login" sx={{ fontWeight: 600, textDecoration: "none" }}>Sign In</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
