import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Box,
  IconButton,
  Badge,
  Tooltip,
} from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        backdropFilter: "blur(10px)",
        height: 46,
        justifyContent: "center",
        zIndex: (t) => t.zIndex.drawer - 1,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", minHeight: "46px !important", px: { xs: 1, sm: 1.5 } }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ ml: { xs: 5, md: 0 }, fontSize: "0.82rem" }}>
          Safety Alert System
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Notifications">
            <IconButton size="small">
              <Badge badgeContent={0} color="error">
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <Avatar
              src={user?.profile_picture}
              sx={{ bgcolor: "primary.main", width: 30, height: 30, fontSize: "0.75rem" }}
            >
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="caption" fontWeight={600} sx={{ lineHeight: 1.2, display: "block" }}>
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem", lineHeight: 1 }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
