import React, { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Button, Grid, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Chip, MenuItem, InputAdornment, Avatar, Tooltip, CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, Phone as PhoneIcon, Email as EmailIcon,
  Person as PersonIcon, ContactPhone as ContactPhoneIcon,
} from "@mui/icons-material";
import { contactsAPI } from "../services/api";
import toast from "react-hot-toast";
import Loading from "../components/Loading";

const priorityColors = { low: "success", medium: "info", high: "warning", critical: "error" };
const emptyForm = { name: "", relationship: "", phone: "", email: "", priority: "medium" };

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try {
      const params = search ? { search } : {};
      const response = await contactsAPI.getAll(params);
      setContacts(response.data);
    } catch (error) {
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchContacts(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenDialog = (contact = null) => {
    if (contact) {
      setSelectedContact(contact);
      setForm({ name: contact.name, relationship: contact.relationship, phone: contact.phone, email: contact.email || "", priority: contact.priority });
    } else {
      setSelectedContact(null);
      setForm(emptyForm);
    }
    setDialogOpen(true);
  };

const handleSave = async () => {
  if (!form.name || !form.relationship || !form.phone) {
    toast.error("Please fill in all required fields");
    return;
  }

  // Phone number must be exactly 10 digits
  if (!/^\d{10}$/.test(form.phone)) {
    toast.error("Phone number must be exactly 10 digits");
    return;
  }

  setSaving(true);
  const payload = { ...form, email: form.email || undefined };

  try {
    if (selectedContact) {
      await contactsAPI.update(selectedContact.id, payload);
      toast.success("Contact updated");
    } else {
      await contactsAPI.create(payload);
      toast.success("Contact added");
    }

    setDialogOpen(false);
    fetchContacts();
  } catch (error) {
    toast.error(
      typeof error.response?.data?.detail === "string"
        ? error.response.data.detail
        : "Failed to save contact"
    );
  } finally {
    setSaving(false);
  }
};


  const handleDelete = async () => {
    try {
      await contactsAPI.delete(selectedContact.id);
      toast.success("Contact deleted");
      setDeleteDialogOpen(false);
      fetchContacts();
    } catch (error) { toast.error("Failed to delete contact"); }
  };

  if (loading) return <Loading message="Loading contacts..." />;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Emergency Contacts</Typography>
          <Typography variant="body2" color="text.secondary">Manage your emergency contacts</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} size="small"
          sx={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", fontSize: "0.78rem" }}>
          Add Contact
        </Button>
      </Box>

      <TextField fullWidth placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)}
        size="small" sx={{ mb: 2 }}
        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment>) }} />

      {contacts.length === 0 ? (
        <Card sx={{ textAlign: "center", py: 4 }}>
          <CardContent>
            <ContactPhoneIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
            <Typography variant="subtitle1" color="text.secondary">No contacts yet</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} size="small" sx={{ mt: 1 }}>
              Add Contact
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={1.5}>
          {contacts.map((contact) => (
            <Grid item xs={12} sm={6} lg={4} key={contact.id}>
              <Card sx={{ height: "100%", transition: "transform 0.2s", "&:hover": { transform: "translateY(-2px)", boxShadow: 3 } }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ bgcolor: "primary.main", width: 34, height: 34, fontSize: "0.85rem" }}>{contact.name[0]}</Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>{contact.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{contact.relationship}</Typography>
                      </Box>
                    </Box>
                    <Chip label={contact.priority} size="small" color={priorityColors[contact.priority]} />
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.25 }}>
                      <PhoneIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                      <Typography variant="caption">{contact.phone}</Typography>
                    </Box>
                    {contact.email && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <EmailIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                        <Typography variant="caption">{contact.email}</Typography>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5, mt: 1 }}>
                    <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => handleOpenDialog(contact)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { setSelectedContact(contact); setDeleteDialogOpen(true); }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>{selectedContact ? "Edit Contact" : "Add Contact"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={1.5} sx={{ mt: 0.25 }}>
            <Grid item xs={12}><TextField fullWidth size="small" label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="Relationship" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} required placeholder="e.g., Spouse, Parent" /></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="Email (Optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <MenuItem value="low">Low</MenuItem><MenuItem value="medium">Medium</MenuItem><MenuItem value="high">High</MenuItem><MenuItem value="critical">Critical</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" size="small">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving} size="small">
            {saving ? <CircularProgress size={16} /> : selectedContact ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontSize: "1rem" }}>Delete Contact</DialogTitle>
        <DialogContent><Typography variant="body2">Delete <strong>{selectedContact?.name}</strong>?</Typography></DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" size="small">Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" size="small">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Contacts;
