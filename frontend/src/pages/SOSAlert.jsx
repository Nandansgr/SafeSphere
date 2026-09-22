import React, { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Grid, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination,
  TextField, InputAdornment, MenuItem,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import SOSButton from "../components/SOSButton";
import { sosAPI } from "../services/api";
import Loading from "../components/Loading";

const statusColors = { active: "error", acknowledged: "warning", resolved: "success", cancelled: "default" };

const SOSAlert = () => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => { fetchHistory(); }, [page, rowsPerPage, statusFilter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = { page: page + 1, per_page: rowsPerPage };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const response = await sosAPI.getHistory(params);
      setHistory(response.data);
    } catch (error) { console.error("Failed to fetch SOS history:", error); }
    finally { setLoading(false); }
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>SOS Alert</Typography>
        <Typography variant="body2" color="text.secondary">Press the button for immediate help</Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: "center", py: 2 }}>
            <CardContent><SOSButton /></CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Alert History</Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchHistory()} sx={{ flex: 1 }}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment>) }} />
                <TextField size="small" select label="Status" value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} sx={{ minWidth: 110 }}>
                  <MenuItem value="">All</MenuItem><MenuItem value="active">Active</MenuItem>
                  <MenuItem value="acknowledged">Acknowledged</MenuItem><MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </Box>
              {loading ? <Loading message="Loading..." /> : history?.alerts?.length > 0 ? (
                <>
                  <TableContainer><Table size="small">
                    <TableHead><TableRow>
                      <TableCell>Type</TableCell><TableCell>Message</TableCell>
                      <TableCell>Location</TableCell><TableCell>Status</TableCell><TableCell>Date</TableCell>
                    </TableRow></TableHead>
                    <TableBody>
                      {history.alerts.map((alert) => (
                        <TableRow key={alert.id} hover>
                          <TableCell><Chip label={alert.alert_type} size="small" variant="outlined" /></TableCell>
                          <TableCell sx={{ maxWidth: 180 }}><Typography variant="caption" noWrap>{alert.message || "-"}</Typography></TableCell>
                          <TableCell sx={{ maxWidth: 130 }}><Typography variant="caption" noWrap>{alert.address || "-"}</Typography></TableCell>
                          <TableCell><Chip label={alert.status} size="small" color={statusColors[alert.status]} /></TableCell>
                          <TableCell><Typography variant="caption">{new Date(alert.created_at).toLocaleString()}</Typography></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table></TableContainer>
                  <TablePagination component="div" count={history.total} page={page} onPageChange={(e, p) => setPage(p)}
                    rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }} />
                </>
              ) : <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>No SOS alerts.</Typography>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SOSAlert;
