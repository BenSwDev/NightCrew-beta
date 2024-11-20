// app/components/SearchJobsTable.tsx
"use client";

import React, { useEffect, useState, useContext, ReactElement } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
  useTheme,
  Badge,
  Pagination,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send"; // Use SendIcon as ApplyIcon
import axios from "@/utils/axios";
import { AuthContext } from "@/contexts/AuthContext";
import { NotificationContext } from "@/contexts/NotificationContext";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer, itemFadeIn } from "@/utils/motion";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface Job {
  _id: string;
  role: string;
  venue: string;
  location: { city: string; street?: string; number?: string };
  date: string;
  startTime: string;
  endTime: string;
  paymentType: string;
  paymentAmount: number;
  currency: string;
  description?: string;
  createdBy: {
    name: string;
    email: string;
    avatarUrl: string;
  };
}

export default function SearchJobsTable(): ReactElement {
  const { user } = useContext(AuthContext);
  const { notify } = useContext(NotificationContext);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0); // zero-based page index
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [excludeApplied, setExcludeApplied] = useState<boolean>(true); // Existing state
  const [excludePostedJobs, setExcludePostedJobs] = useState<boolean>(false); // New state
  const theme = useTheme();

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, excludeApplied, excludePostedJobs]);

  const fetchJobs = async () => {
    if (!user) {
      notify("You must be logged in to view jobs.", "warning");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get("/api/jobs", {
        params: {
          page: page + 1, // API expects 1-based page index
          limit: rowsPerPage,
          search: excludeApplied ? "true" : undefined, // Use 'search=true' to exclude applied jobs
          excludePostedJobs: excludePostedJobs ? "true" : undefined, // Exclude user-posted jobs
        },
      });
      console.log("Jobs fetched:", response.data.jobs); // Debugging
      setJobs(response.data.jobs);
      setTotalJobs(response.data.totalJobs); // Set totalJobs
    } catch (error: unknown) {
      console.error("Error fetching jobs:", error);
      if (axios.isAxiosError(error)) {
        notify(error.response?.data?.error || "Failed to fetch jobs.", "error");
      } else {
        notify("An unexpected error occurred.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!user) {
      notify("You must be logged in to apply for a job.", "warning");
      return;
    }

    try {
      await axios.post(`/api/jobs/${jobId}/apply`);
      notify("Applied to job successfully.", "success");
      // Optionally, refresh the jobs list or remove the applied job
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
      setTotalJobs((prevTotal) => prevTotal - 1);
    } catch (error: unknown) {
      console.error("Error applying to job:", error);
      if (axios.isAxiosError(error)) {
        notify(error.response?.data?.error || "Failed to apply to job.", "error");
      } else {
        notify("An unexpected error occurred.", "error");
      }
    }
  };

  const handleToggleExcludeApplied = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExcludeApplied(event.target.checked);
    setPage(0); // Reset to first page when toggling
  };

  const handleToggleExcludePostedJobs = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExcludePostedJobs(event.target.checked);
    setPage(0); // Reset to first page when toggling
  };

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: jobs.length > 3,
    speed: 500,
    slidesToShow: Math.min(jobs.length, 3),
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024, // Tablet
        settings: {
          slidesToShow: Math.min(jobs.length, 2),
        },
      },
      {
        breakpoint: 600, // Mobile
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      style={{ width: "100%" }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={excludeApplied}
              onChange={handleToggleExcludeApplied}
              name="excludeApplied"
              color="primary"
            />
          }
          label="Exclude Applied Jobs"
        />
        <FormControlLabel
          control={
            <Switch
              checked={excludePostedJobs}
              onChange={handleToggleExcludePostedJobs}
              name="excludePostedJobs"
              color="primary"
            />
          }
          label="Exclude My Jobs"
        />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : jobs.length > 0 ? (
        <>
          {/* Desktop Table */}
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Paper sx={{ width: "100%", overflow: "hidden", mb: 4 }}>
              <Typography variant="h6" sx={{ p: 2 }}>
                Search Jobs
              </Typography>
              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <TableContainer>
                  <Table aria-label="search jobs table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Role</TableCell>
                        <TableCell>Venue</TableCell>
                        <TableCell>City</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Payment</TableCell>
                        <TableCell align="center">Apply</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job._id}>
                          <TableCell>{job.role}</TableCell>
                          <TableCell>{job.venue}</TableCell>
                          <TableCell>{job.location.city}</TableCell>
                          <TableCell>{new Date(job.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {job.startTime} - {job.endTime}
                          </TableCell>
                          <TableCell>
                            {job.paymentAmount} {job.currency} ({job.paymentType})
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip
                              title={
                                !user || job.createdBy.email === user.email
                                  ? "You cannot apply to your own job"
                                  : "Apply to this job"
                              }
                            >
                              <span>
                                <IconButton
                                  color="primary"
                                  onClick={() => handleApply(job._id)}
                                  disabled={!user || job.createdBy.email === user.email}
                                >
                                  <SendIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>
          </Box>

          {/* Tablet & Mobile Slider */}
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 4 }}>
            <Slider {...sliderSettings}>
              {jobs.map((job) => (
                <motion.div key={job._id} variants={itemFadeIn}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      m: 2,
                      borderRadius: 2,
                      backgroundColor: theme.palette.background.paper,
                      boxShadow: theme.shadows[5],
                      position: "relative",
                    }}
                  >
                    {/* Background Number */}
                    <Typography
                      variant="h1"
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        fontSize: "4rem",
                        color: theme.palette.action.disabled,
                        opacity: 0.2,
                        userSelect: "none",
                      }}
                    >
                      {jobs.length}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {job.role}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {job.venue} - {job.location.city}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Date: {new Date(job.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Time: {job.startTime} - {job.endTime}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Payment: {job.paymentAmount} {job.currency} ({job.paymentType})
                    </Typography>
                    {job.description && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {job.description}
                      </Typography>
                    )}
                    <Box sx={{ mt: "auto", display: "flex", justifyContent: "flex-end", gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SendIcon />}
                        onClick={() => handleApply(job._id)}
                        disabled={!user || job.createdBy.email === user.email}
                        component={motion.button}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Apply
                      </Button>
                    </Box>
                  </Paper>
                </motion.div>
              ))}
            </Slider>
          </Box>
        </>
      ) : (
        <Typography variant="body1" align="center" sx={{ my: 4 }}>
          No jobs found.
        </Typography>
      )}

      {/* Pagination Controls */}
      {/* For simplicity, pagination is maintained only for desktop tables */}
      <Box sx={{ display: { xs: "none", md: "flex" }, justifyContent: "center", mt: 2 }}>
        <Pagination
          count={Math.ceil(totalJobs / rowsPerPage)}
          page={page + 1}
          onChange={(event, value) => setPage(value - 1)}
          color="primary"
        />
      </Box>
    </motion.div>
  );
}
