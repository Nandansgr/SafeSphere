import React, { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Tabs, Tab, TextField, MenuItem,
  InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Chip, Button,
} from "@mui/material";
import { Search as SearchIcon, Download as DownloadIcon } from "@mui/icons-material";
import { sosAPI, incidentAPI } from "../services/api";
import Loading from "../components/Loading";
import toast from "react-hot-toast";

const statusColors = { active: "error", acknowledged: "warning", resolved: "success", cancelled: "default", pending: "warning", investigating: "info", closed: "default" };
const severityColors = { low: "success", medium: "info", high: "warning", critical: "error" };

const AlertHistory = () => {
  const [tab, setTab] = useState(0);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => { fetchData(); }, [tab, page, rowsPerPage, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 0) {
        const params = { page: page + 1, per_page: rowsPerPage };
        if (statusFilter) params.status = statusFilter;
        if (search) params.search = search;
        const response = await sosAPI.getHistory(params);
        setSosAlerts(response.data.alerts || []);
      } else {
        const params = { page: page + 1, per_page: rowsPerPage };
        if (statusFilter) params.status = statusFilter;
        if (search) params.search = search;
        const response = await incidentAPI.getAll(params);
        setIncidents(response.data || []);
      }
    } catch (error) { toast.error("Failed to load history"); }
    finally { setLoading(false); }
  };

  const exportToCSV = () => {
    const data = tab === 0 ? sosAlerts : incidents;
    if (data.length === 0) { toast.error("No data to export"); return; }
    let csv = tab === 0 ? "Type,Message,Location,Status,Date\n" : "ID,Type,Location,Severity,Status,Date\n";
    data.forEach((r) => {
      if (tab === 0) csv += `"${r.alert_type}","${r.message||""}","${r.address||""}","${r.status}","${new Date(r.created_at).toLocaleString()}"\n`;
      else csv += `"${r.incident_id}","${r.incident_type}","${r.location}","${r.severity}","${r.status}","${new Date(r.created_at).toLocaleString()}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${tab === 0 ? "sos_alerts" : "incidents"}_history.csv`;
    link.click(); toast.success("CSV downloaded");
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Alert History</Typography>
          <Typography variant="body2" color="text.secondary">All alerts and incident reports</Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportToCSV} size="small" sx={{ fontSize: "0.78rem" }}>Export CSV</Button>
      </Box>
      <Card>
        <CardContent sx={{ p: 1.5 }}>
          <Tabs value={tab} onChange={(e, v) => { setTab(v); setPage(0); setStatusFilter(""); setSearch(""); }} sx={{ mb: 1.5, minHeight: 32 }}>
            <Tab label="SOS Alerts" sx={{ minHeight: 32, fontSize: "0.8rem" }} />
            <Tab label="Incidents" sx={{ minHeight: 32, fontSize: "0.8rem" }} />
          </Tabs>
          <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
            <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData()} sx={{ flex: 1, minWidth: 150 }}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment>) }} />
            <TextField size="small" select label="Status" value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} sx={{ minWidth: 110 }}>
              <MenuItem value="">All</MenuItem>
              {tab === 0 ? (<><MenuItem value="active">Active</MenuItem><MenuItem value="acknowledged">Ack</MenuItem><MenuItem value="resolved">Resolved</MenuItem><MenuItem value="cancelled">Cancelled</MenuItem></>) :
                (<><MenuItem value="pending">Pending</MenuItem><MenuItem value="investigating">Investigating</MenuItem><MenuItem value="resolved">Resolved</MenuItem><MenuItem value="closed">Closed</MenuItem></>)}
            </TextField>
          </Box>
          {loading ? <Loading message="Loading..." /> : tab === 0 ? (
            sosAlerts.length > 0 ? (
              <>
                <TableContainer><Table size="small">
                  <TableHead><TableRow><TableCell>Type</TableCell><TableCell>Message</TableCell><TableCell>Location</TableCell><TableCell>Status</TableCell><TableCell>Date</TableCell></TableRow></TableHead>
                  <TableBody>{sosAlerts.map((a) => (
                    <TableRow key={a.id} hover>
                      <TableCell><Chip label={a.alert_type} size="small" variant="outlined" /></TableCell>
                      <TableCell sx={{ maxWidth: 180 }}><Typography variant="caption" noWrap>{a.message || "-"}</Typography></TableCell>
                      <TableCell sx={{ maxWidth: 130 }}><Typography variant="caption" noWrap>{a.address || "-"}</Typography></TableCell>
                      <TableCell><Chip label={a.status} size="small" color={statusColors[a.status]} /></TableCell>
                      <TableCell><Typography variant="caption">{new Date(a.created_at).toLocaleString()}</Typography></TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table></TableContainer>
                <TablePagination component="div" count={sosAlerts.length} page={page} onPageChange={(e, p) => setPage(p)}
                  rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }} />
              </>
            ) : <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>No SOS alerts found.</Typography>
          ) : incidents.length > 0 ? (
            <>
              <TableContainer><Table size="small">
                <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Type</TableCell><TableCell>Location</TableCell><TableCell>Severity</TableCell><TableCell>Status</TableCell><TableCell>Date</TableCell></TableRow></TableHead>
                <TableBody>{incidents.map((i) => (
                  <TableRow key={i.id} hover>
                    <TableCell><Typography variant="caption" fontWeight={600}>{i.incident_id}</Typography></TableCell>
                    <TableCell><Chip label={i.incident_type} size="small" variant="outlined" /></TableCell>
                    <TableCell sx={{ maxWidth: 150 }}><Typography variant="caption" noWrap>{i.location}</Typography></TableCell>
                    <TableCell><Chip label={i.severity} size="small" color={severityColors[i.severity]} /></TableCell>
                    <TableCell><Chip label={i.status} size="small" color={statusColors[i.status]} /></TableCell>
                    <TableCell><Typography variant="caption">{new Date(i.created_at).toLocaleString()}</Typography></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table></TableContainer>
              <TablePagination component="div" count={incidents.length} page={page} onPageChange={(e, p) => setPage(p)}
                rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }} />
            </>
          ) : <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>No incidents found.</Typography>}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AlertHistory;
