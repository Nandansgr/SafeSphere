import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Contacts as ContactsIcon,
  Warning as WarningIcon,
  Assessment as IncidentIcon,
  Security as SecurityIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";
import DashboardCard from "../components/DashboardCard";
import SOSButton from "../components/SOSButton";
import { dashboardAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading dashboard..." />;

  const getStatusColor = (status) => {
    const map = { active: "error", resolved: "success", pending: "warning", investigating: "info" };
    return map[status] || "default";
  };

  const getSeverityColor = (severity) => {
    const map = { critical: "error", high: "warning", medium: "info", low: "success" };
    return map[severity] || "default";
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Welcome back, {user?.first_name}!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Stay safe. Here&apos;s your safety overview.
        </Typography>
      </Box>

      <Grid container spacing={1.5}>
        <Grid item xs={6} sm={6} lg={3}>
          <DashboardCard
            title="Contacts"
            value={stats?.total_contacts || 0}
            icon={<ContactsIcon />}
            color="#6366f1"
            subtitle="People who care"
          />
        </Grid>
        <Grid item xs={6} sm={6} lg={3}>
          <DashboardCard
            title="SOS Alerts"
            value={stats?.total_sos_alerts || 0}
            icon={<WarningIcon />}
            color="#ef4444"
            subtitle={`${stats?.active_sos || 0} active`}
          />
        </Grid>
        <Grid item xs={6} sm={6} lg={3}>
          <DashboardCard
            title="Incidents"
            value={stats?.total_incidents || 0}
            icon={<IncidentIcon />}
            color="#f59e0b"
            subtitle="Filed reports"
          />
        </Grid>
        <Grid item xs={6} sm={6} lg={3}>
          <DashboardCard
            title="Protection"
            value="Active"
            icon={<SecurityIcon />}
            color="#10b981"
            subtitle="System online"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Quick SOS
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                <SOSButton />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Recent Alerts
                </Typography>
                <Typography
                  variant="body2"
                  color="primary.main"
                  sx={{ cursor: "pointer", fontWeight: 600, fontSize: "0.72rem" }}
                  onClick={() => navigate("/history")}
                >
                  View All
                </Typography>
              </Box>
              {stats?.recent_alerts?.length > 0 ? (
                <List dense disablePadding>
                  {stats.recent_alerts.map((alert) => (
                    <ListItem key={alert.id} sx={{ px: 0, py: 0.3 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CircleIcon sx={{ fontSize: 8, color: alert.status === "active" ? "error.main" : "success.main" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={alert.alert_type?.toUpperCase()}
                        secondary={alert.address || "No location"}
                        primaryTypographyProps={{ fontSize: "0.78rem", fontWeight: 500 }}
                        secondaryTypographyProps={{ fontSize: "0.68rem" }}
                      />
                      <Chip label={alert.status} size="small" color={getStatusColor(alert.status)} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>
                  No alerts yet. You&apos;re safe!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Recent Incidents
                </Typography>
                <Typography
                  variant="body2"
                  color="primary.main"
                  sx={{ cursor: "pointer", fontWeight: 600, fontSize: "0.72rem" }}
                  onClick={() => navigate("/incidents")}
                >
                  View All
                </Typography>
              </Box>
              {stats?.recent_incidents?.length > 0 ? (
                <List dense disablePadding>
                  {stats.recent_incidents.map((incident) => (
                    <ListItem key={incident.id} sx={{ px: 0, py: 0.3 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CircleIcon sx={{ fontSize: 8, color: `${getSeverityColor(incident.severity)}.main` }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={incident.incident_id}
                        secondary={incident.incident_type}
                        primaryTypographyProps={{ fontSize: "0.78rem", fontWeight: 500 }}
                        secondaryTypographyProps={{ fontSize: "0.68rem" }}
                      />
                      <Chip label={incident.severity} size="small" color={getSeverityColor(incident.severity)} variant="outlined" />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>
                  No incidents reported yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Recent Activities
              </Typography>
              {stats?.recent_activities?.length > 0 ? (
                <List dense disablePadding>
                  {stats.recent_activities.map((activity) => (
                    <ListItem key={activity.id} sx={{ px: 0, py: 0.3 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CircleIcon sx={{ fontSize: 6, color: "primary.main" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.action?.replace(/_/g, " ").toUpperCase()}
                        secondary={activity.created_at ? new Date(activity.created_at).toLocaleString() : ""}
                        primaryTypographyProps={{ fontSize: "0.78rem", fontWeight: 500 }}
                        secondaryTypographyProps={{ fontSize: "0.68rem" }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>
                  No recent activity.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
