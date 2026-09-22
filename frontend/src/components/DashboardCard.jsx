import React from "react";
import { Card, CardContent, Typography, Box, Avatar } from "@mui/material";

const DashboardCard = ({ title, value, icon, color, subtitle }) => {
  return (
    <Card
      sx={{
        height: "100%",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`
            : `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 4px 15px ${color}20`,
        },
      }}
    >
      <CardContent sx={{ p: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom sx={{ fontSize: "0.72rem" }}>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ color, fontSize: "1.3rem" }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: "block", fontSize: "0.65rem" }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: `${color}20`,
              color: color,
              width: 38,
              height: 38,
            }}
          >
            {React.cloneElement(icon, { fontSize: "small" })}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
