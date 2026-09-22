import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Card, CardContent, TextField, Button, Typography, Link, Alert, InputAdornment, IconButton, CircularProgress } from "@mui/material";
import { Visibility, VisibilityOff, Email as EmailIcon, Lock as LockIcon, Shield as ShieldIcon } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try { await login(form.email, form.password); toast.success("Welcome back!"); navigate("/dashboard"); }
    catch (err) {
      const d = err.response?.data?.detail;
      const msg = Array.isArray(d) ? d.map((e) => e.msg || String(e)).join(", ") : (typeof d === "string" ? d : "Login failed.");
      setError(msg);
    }
    finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: (t) => t.palette.mode === "dark" ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" : "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #f1f5f9 100%)", p: 2 }}>
      <Card sx={{ maxWidth: 400, width: "100%", p: 2.5, backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
        <CardContent>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Box sx={{ width: 52, height: 52, borderRadius: 2, bgcolor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
              <ShieldIcon sx={{ fontSize: 28, color: "#fff" }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>Welcome Back</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>Sign in to Safety Alert System</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2, py: 0 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth size="small" name="email" label="Email" type="email" value={form.email} onChange={handleChange} required sx={{ mb: 1.5 }}
              InputProps={{ startAdornment: (<InputAdornment position="start"><EmailIcon color="action" fontSize="small" /></InputAdornment>) }} />
            <TextField fullWidth size="small" name="password" label="Password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} required sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><LockIcon color="action" fontSize="small" /></InputAdornment>),
                endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment>),
              }} />
            <Button fullWidth type="submit" variant="contained" disabled={loading} sx={{ py: 1, fontSize: "0.85rem", fontWeight: 600, background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", "&:hover": { background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)" } }}>
              {loading ? <CircularProgress size={20} color="inherit" /> : "Sign In"}
            </Button>
            <Typography variant="body2" textAlign="center" sx={{ mt: 2, color: "text.secondary" }}>
              Don&apos;t have an account? <Link component={RouterLink} to="/register" sx={{ fontWeight: 600, textDecoration: "none" }}>Create Account</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
