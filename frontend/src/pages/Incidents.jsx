import React, { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Button, Grid, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Chip, MenuItem, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, InputAdornment, Tooltip, CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, Assessment as AssessmentIcon, Visibility as ViewIcon,
} from "@mui/icons-material";
import { incidentAPI } from "../services/api";
import toast from "react-hot-toast";
import Loading from "../components/Loading";

const severityColors = { low: "success", medium: "info", high: "warning", critical: "error" };
const statusColors = { pending: "warning", investigating: "info", resolved: "success", closed: "default" };
const incidentTypes = ["theft", "assault", "accident", "fire", "harassment", "vandalism", "medical", "other"];
const emptyForm = { incident_type: "theft", description: "", location: "", severity: "medium" };

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => { fetchIncidents(); }, [page, rowsPerPage, severityFilter, statusFilter]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params = { page: page + 1, per_page: rowsPerPage };
      if (search) params.search = search;
      if (severityFilter) params.severity = severityFilter;
      if (statusFilter) params.status = statusFilter;
      const response = await incidentAPI.getAll(params);
      setIncidents(response.data);
    } catch (error) { toast.error("Failed to load incidents"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.description || !form.location) { toast.error("Fill in all required fields"); return; }
    if (form.description.length < 10) { toast.error("Description min 10 characters"); return; }
    setSaving(true);
    try {
      if (selectedIncident) { await incidentAPI.update(selectedIncident.id, form); toast.success("Incident updated"); }
      else { await incidentAPI.create(form); toast.success("Incident reported"); }
      setDialogOpen(false); setForm(emptyForm); fetchIncidents();
    } catch (error) { toast.error(typeof error.response?.data?.detail === "string" ? error.response.data.detail : "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await incidentAPI.delete(selectedIncident.id); toast.success("Deleted"); setDeleteDialogOpen(false); fetchIncidents(); }
    catch (error) { toast.error("Failed to delete"); }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Incident Reports</Typography>
          <Typography variant="body2" color="text.secondary">Report and track safety incidents</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} size="small"
          onClick={() => { setSelectedIncident(null); setForm(emptyForm); setDialogOpen(true); }}
          sx={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", fontSize: "0.78rem" }}>
          Report Incident
        </Button>
      </Box>
      <Card>
        <CardContent sx={{ p: 1.5 }}>
          <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
            <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchIncidents()} sx={{ flex: 1, minWidth: 150 }}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment>) }} />
            <TextField size="small" select label="Severity" value={severityFilter}
              onChange={(e) => { setSeverityFilter(e.target.value); setPage(0); }} sx={{ minWidth: 100 }}>
              <MenuItem value="">All</MenuItem><MenuItem value="low">Low</MenuItem><MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem><MenuItem value="critical">Critical</MenuItem>
            </TextField>
            <TextField size="small" select label="Status" value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} sx={{ minWidth: 110 }}>
              <MenuItem value="">All</MenuItem><MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="investigating">Investigating</MenuItem><MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>
          </Box>
          {loading ? <Loading message="Loading..." /> : incidents.length > 0 ? (
            <>
              <TableContainer><Table size="small">
                <TableHead><TableRow>
                  <TableCell>ID</TableCell><TableCell>Type</TableCell><TableCell>Location</TableCell>
                  <TableCell>Severity</TableCell><TableCell>Status</TableCell><TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {incidents.map((incident) => (
                    <TableRow key={incident.id} hover>
                      <TableCell><Typography variant="caption" fontWeight={600}>{incident.incident_id}</Typography></TableCell>
                      <TableCell><Chip label={incident.incident_type} size="small" variant="outlined" /></TableCell>
                      <TableCell sx={{ maxWidth: 120 }}><Typography variant="caption" noWrap>{incident.location}</Typography></TableCell>
                      <TableCell><Chip label={incident.severity} size="small" color={severityColors[incident.severity]} /></TableCell>
                      <TableCell><Chip label={incident.status} size="small" color={statusColors[incident.status]} /></TableCell>
                      <TableCell><Typography variant="caption">{new Date(incident.created_at).toLocaleDateString()}</Typography></TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => { setSelectedIncident(incident); setViewDialogOpen(true); }}><ViewIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="primary" onClick={() => { setSelectedIncident(incident); setForm({ incident_type: incident.incident_type, description: incident.description, location: incident.location, severity: incident.severity }); setDialogOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => { setSelectedIncident(incident); setDeleteDialogOpen(true); }}><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table></TableContainer>
              <TablePagination component="div" count={incidents.length} page={page} onPageChange={(e, p) => setPage(p)}
                rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }} />
            </>
          ) : <Box sx={{ textAlign: "center", py: 4 }}><AssessmentIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} /><Typography variant="body2" color="text.secondary">No incidents found</Typography></Box>}
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>{selectedIncident ? "Edit Incident" : "Report Incident"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={1.5} sx={{ mt: 0.25 }}>
            <Grid item xs={12}><TextField fullWidth size="small" select label="Type" value={form.incident_type} onChange={(e) => setForm({ ...form, incident_type: e.target.value })}>
              {incidentTypes.map((t) => <MenuItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</MenuItem>)}
            </TextField></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" multiline rows={2} label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" select label="Severity" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              <MenuItem value="low">Low</MenuItem><MenuItem value="medium">Medium</MenuItem><MenuItem value="high">High</MenuItem><MenuItem value="critical">Critical</MenuItem>
            </TextField></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" size="small">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving} size="small">{saving ? <CircularProgress size={16} /> : selectedIncident ? "Update" : "Submit"}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>Incident Details</DialogTitle>
        <DialogContent>
          {selectedIncident && (
            <Grid container spacing={1.5} sx={{ mt: 0.25 }}>
              <Grid item xs={6}><Typography variant="caption" color="text.secondary">ID</Typography><Typography variant="body2" fontWeight={600}>{selectedIncident.incident_id}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" color="text.secondary">Type</Typography><Typography variant="body2" fontWeight={600}>{selectedIncident.incident_type}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" color="text.secondary">Severity</Typography><Chip label={selectedIncident.severity} size="small" color={severityColors[selectedIncident.severity]} /></Grid>
              <Grid item xs={6}><Typography variant="caption" color="text.secondary">Status</Typography><Chip label={selectedIncident.status} size="small" color={statusColors[selectedIncident.status]} /></Grid>
              <Grid item xs={12}><Typography variant="caption" color="text.secondary">Location</Typography><Typography variant="body2">{selectedIncident.location}</Typography></Grid>
              <Grid item xs={12}><Typography variant="caption" color="text.secondary">Description</Typography><Typography variant="body2">{selectedIncident.description}</Typography></Grid>
              <Grid item xs={12}><Typography variant="caption" color="text.secondary">Reported</Typography><Typography variant="body2">{new Date(selectedIncident.created_at).toLocaleString()}</Typography></Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}><Button onClick={() => setViewDialogOpen(false)} variant="outlined" size="small">Close</Button></DialogActions>
      </Dialog>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontSize: "1rem" }}>Delete Incident</DialogTitle>
        <DialogContent><Typography variant="body2">Delete <strong>{selectedIncident?.incident_id}</strong>?</Typography></DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" size="small">Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" size="small">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Incidents;
