import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Contacts as ContactsIcon,
  Warning as WarningIcon,
  Assessment as IncidentIcon,
  History as HistoryIcon,
  Person as ProfileIcon,
  Shield as ShieldIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useTheme as useAppTheme } from "../context/ThemeContext";

const DRAWER_WIDTH = 200;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon fontSize="small" />, path: "/dashboard" },
  { text: "Contacts", icon: <ContactsIcon fontSize="small" />, path: "/contacts" },
  { text: "SOS Alert", icon: <WarningIcon fontSize="small" />, path: "/sos" },
  { text: "Incidents", icon: <IncidentIcon fontSize="small" />, path: "/incidents" },
  { text: "History", icon: <HistoryIcon fontSize="small" />, path: "/history" },
  { text: "Profile", icon: <ProfileIcon fontSize="small" />, path: "/profile" },
];

const Sidebar = ({ mobileOpen, onToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { mode, toggleTheme } = useAppTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) onToggle();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          mode === "dark"
            ? "linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)"
            : "linear-gradient(180deg, #eef2ff 0%, #ffffff 100%)",
      }}
    >
      <Box sx={{ px: 1.5, py: 1.2, display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 34, height: 34 }}>
          <ShieldIcon sx={{ fontSize: 20 }} />
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2, fontSize: "0.9rem" }}>
            SafeGuard
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem" }}>
            Protection System
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={onToggle} sx={{ ml: "auto", p: 0.5 }}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ mx: 1.5 }} />

      <List sx={{ flex: 1, px: 1, py: 0.5 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: 1.5,
                  px: 1.5,
                  py: 0.6,
                  minHeight: 36,
                  backgroundColor: isActive ? "primary.main" : "transparent",
                  color: isActive ? "#fff" : "text.primary",
                  "&:hover": {
                    backgroundColor: isActive ? "primary.dark" : "action.hover",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <ListItemIcon
                  sx={{ color: isActive ? "#fff" : "text.secondary", minWidth: 32 }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    fontSize: "0.78rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ mx: 1.5 }} />

      <Box sx={{ px: 1, py: 0.5 }}>
        <ListItemButton onClick={toggleTheme} sx={{ borderRadius: 1.5, mb: 0.25, py: 0.5 }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            {mode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText
            primary={mode === "dark" ? "Light Mode" : "Dark Mode"}
            primaryTypographyProps={{ fontSize: "0.78rem" }}
          />
        </ListItemButton>

        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1.5, color: "error.main", py: 0.5 }}>
          <ListItemIcon sx={{ minWidth: 32, color: "error.main" }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: "0.78rem" }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          onClick={onToggle}
          sx={{
            position: "fixed",
            top: 10,
            left: 10,
            zIndex: theme.zIndex.drawer + 1,
            bgcolor: "background.paper",
            boxShadow: 2,
            p: 0.7,
          }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={onToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: "none",
            boxShadow: isMobile ? 4 : "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export { DRAWER_WIDTH };
export default Sidebar;
