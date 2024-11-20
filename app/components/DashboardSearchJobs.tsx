// app/components/DashboardSearchJobs.tsx
"use client";

import React, { ReactElement } from "react";
import { Grid } from "@mui/material";
import SearchJobsTable from "./SearchJobsTable";
import MyJobsCard from "./MyJobsCard";
import MyApplicationsCard from "./MyApplicationsCard";
import HistoryCard from "./HistoryCard";

export default function DashboardSearchJobs(): ReactElement {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <SearchJobsTable />
      </Grid>
      <Grid item xs={12} md={4}>
        <MyJobsCard />
      </Grid>
      <Grid item xs={12} md={4}>
        <MyApplicationsCard  />
      </Grid>
      <Grid item xs={12} md={4}>
        <HistoryCard />
      </Grid>
    </Grid>
  );
}
