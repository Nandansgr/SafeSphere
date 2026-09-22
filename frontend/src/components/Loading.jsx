import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const Loading = ({ message = "Loading..." }) => (
  <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="200px" gap={1}>
    <CircularProgress size={32} />
    <Typography variant="caption" color="text.secondary">{message}</Typography>
  </Box>
);

export default Loading;
