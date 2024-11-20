// app/components/HistoryCard.tsx
"use client";

import React, { ReactElement } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
} from "@mui/material";

export default function HistoryCard(): ReactElement {
  const handleClick = () => {
    // Future implementation
  };

  return (
    <Card sx={{ minWidth: 275, mb: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div">
          History
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          View your job and application history
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={handleClick} disabled>
          Coming Soon
        </Button>
      </CardActions>
    </Card>
  );
}
