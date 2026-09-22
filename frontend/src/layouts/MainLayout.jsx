import React, { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Sidebar, { DRAWER_WIDTH } from "../components/Sidebar";
import Navbar from "../components/Navbar";

const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", overflow: "hidden" }}>
      <Sidebar mobileOpen={mobileOpen} onToggle={() => setMobileOpen(!mobileOpen)} />

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          ml: isMobile ? 0 : `${DRAWER_WIDTH}px`,
        }}
      >
        <Navbar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: "46px",
            overflow: "auto",
            p: { xs: 1, sm: 1.5 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
