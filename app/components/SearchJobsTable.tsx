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
  Pagination,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Modal,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send"; // Use SendIcon as ApplyIcon
import InfoIcon from "@mui/icons-material/Info"; // Icon for details
import axios from "@/utils/axios";
import { AuthContext } from "@/contexts/AuthContext";
import { NotificationContext } from "@/contexts/NotificationContext";
import { motion } from "framer-motion";
import { staggerContainer, itemFadeIn } from "@/utils/motion";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { isAxiosError } from "axios";
import { SelectChangeEvent } from "@mui/material";

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

type DateRangeOption = "all" | "today" | "tomorrow" | "this_week" | "this_month";

export default function SearchJobsTable(): ReactElement {
  const { user } = useContext(AuthContext);
  const { notify } = useContext(NotificationContext);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1); // 1-based page index
  const [rowsPerPage] = useState<number>(10);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [excludeApplied, setExcludeApplied] = useState<boolean>(true); // Exclude Applied Jobs
  const [excludePostedJobs, setExcludePostedJobs] = useState<boolean>(true); // Exclude My Jobs (set to true by default)
  const [cities, setCities] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRangeOption>("all");
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<string>("");
  const theme = useTheme();

  // Function to fetch unique cities and roles for filter dropdowns
  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get("/api/jobs/filters");
      setCities(response.data.cities);
      setRoles(response.data.roles);
    } catch (error: unknown) {
      console.error("Error fetching filter options:", error);
      if (isAxiosError(error)) {
        notify(error.response?.data?.error || "Failed to fetch filter options.", "error");
      } else {
        notify("An unexpected error occurred.", "error");
      }
    }
  };

  useEffect(() => {
    fetchFilterOptions();
    fetchJobs();

    // Set up automatic refresh every 60 seconds
    const interval = setInterval(() => {
      fetchJobs();
    }, 60000); // 60,000 ms = 60 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, excludeApplied, excludePostedJobs, selectedCity, selectedRole, dateRange]);

  const fetchJobs = async () => {
    if (!user) {
      notify("You must be logged in to view jobs.", "warning");
      return;
    }

    setLoading(true);
    try {
      const params: any = {
        page,
        limit: rowsPerPage,
        search: excludeApplied ? "true" : undefined, // Use 'search=true' to exclude applied jobs
        excludePostedJobs: excludePostedJobs ? "true" : undefined, // Exclude user-posted jobs
        city: selectedCity || undefined,
        role: selectedRole || undefined,
        dateRange: dateRange !== "all" ? dateRange : undefined,
      };

      const response = await axios.get("/api/jobs", { params });
      console.log("Jobs fetched:", response.data.jobs); // Debugging
      setJobs(response.data.jobs);
      setTotalJobs(response.data.totalJobs); // Set totalJobs
    } catch (error: unknown) {
      console.error("Error fetching jobs:", error);
      if (isAxiosError(error)) {
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
      if (isAxiosError(error)) {
        notify(error.response?.data?.error || "Failed to apply to job.", "error");
      } else {
        notify("An unexpected error occurred.", "error");
      }
    }
  };

  const handleToggleExcludeApplied = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExcludeApplied(event.target.checked);
    setPage(1); // Reset to first page when toggling
  };

  const handleToggleExcludePostedJobs = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExcludePostedJobs(event.target.checked);
    setPage(1); // Reset to first page when toggling
  };

const handleCityChange = (event: SelectChangeEvent<string>) => {
  setSelectedCity(event.target.value);
  setPage(1);
};

  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    setSelectedRole(event.target.value);
    setPage(1);
  };

  const handleDateRangeChange = (event: SelectChangeEvent<DateRangeOption>) => {
    setDateRange(event.target.value as DateRangeOption);
    setPage(1);
  };

  const handleOpenModal = (description: string) => {
    setModalContent(description);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalContent("");
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
        {/* Exclusion Toggles */}
        <FormControlLabel
          control={
            <Switch
              checked={excludeApplied}
              onChange={handleToggleExcludeApplied}
              name="excludeApplied"
              color="primary"
            />
          }
          label={
            <Typography
              sx={{
                color: theme.palette.mode === "dark" ? "common.white" : "text.primary",
              }}
            >
              Exclude Applied Jobs
            </Typography>
          }
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
          label={
            <Typography
              sx={{
                color: theme.palette.mode === "dark" ? "common.white" : "text.primary",
              }}
            >
              Exclude My Jobs
            </Typography>
          }
        />

        {/* City Filter */}
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="city-filter-label" sx={{ color: theme.palette.mode === "dark" ? "common.white" : "text.primary" }}>
            City
          </InputLabel>
                    <Select
                      labelId="city-filter-label"
                      id="city-filter"
                      value={selectedCity}
                      label="City"
                      onChange={handleCityChange}
                      sx={{
                        "& .MuiSelect-icon": {
                          color: theme.palette.mode === "dark" ? "common.white" : "inherit",
                        },
                        "& .MuiInputBase-input": {
                          color: theme.palette.mode === "dark" ? "common.white" : "inherit",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.mode === "dark" ? "common.white" : "inherit",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.mode === "dark" ? "common.white" : "inherit",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.mode === "dark" ? "common.white" : "primary.main",
                        },
                      }}
                    >
                      <MenuItem>
                        <em>All</em>
                      </MenuItem>
                      {cities.map((city) => (
                        <MenuItem key={city} value={city}>
                          {city}
                        </MenuItem>
                      ))}
                    </Select>
        </FormControl>

        {/* Role Filter */}
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="role-filter-label" sx={{ color: theme.palette.mode === "dark" ? "common.white" : "text.primary" }}>
            Role
          </InputLabel>
          <Select
            labelId="role-filter-label"
            id="role-filter"
            value={selectedRole}
            label="Role"
            onChange={handleRoleChange}
            sx={{
              "& .MuiSelect-icon": {
                color: theme.palette.mode === "dark" ? "common.white" : "inherit",
              },
              "& .MuiInputBase-input": {
                color: theme.palette.mode === "dark" ? "common.white" : "inherit",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.mode === "dark" ? "common.white" : "inherit",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.mode === "dark" ? "common.white" : "inherit",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.mode === "dark" ? "common.white" : "primary.main",
              },
            }}
          >
            <MenuItem>
              <em>All</em>
            </MenuItem>
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Date Range Sort */}
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="date-range-sort-label" sx={{ color: theme.palette.mode === "dark" ? "common.white" : "text.primary" }}>
            Sort By
          </InputLabel>
          <Select
            labelId="date-range-sort-label"
            id="date-range-sort"
            value={dateRange}
            label="Sort By"
            onChange={handleDateRangeChange}
            sx={{
              "& .MuiSelect-icon": {
                color: theme.palette.mode === "dark" ? "common.white" : "inherit",
              },
              "& .MuiInputBase-input": {
                color: theme.palette.mode === "dark" ? "common.white" : "inherit",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.mode === "dark" ? "common.white" : "inherit",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.mode === "dark" ? "common.white" : "inherit",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.mode === "dark" ? "common.white" : "primary.main",
              },
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="tomorrow">Tomorrow</MenuItem>
            <MenuItem value="this_week">This Week</MenuItem>
            <MenuItem value="this_month">This Month</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Results Count */}
      <Box sx={{ px: 2, mb: 2 }}>
        <Typography
          variant="subtitle1"
          sx={{
            color: theme.palette.mode === "dark" ? "common.white" : "text.primary",
          }}
        >
          {totalJobs} {totalJobs === 1 ? "job found" : "jobs found"}
        </Typography>
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
                        <TableCell
                          sx={{
                            color: theme.palette.mode === "dark" ? "common.white" : "text.primary",
                          }}
                        >
                          Role
                        </TableCell>
                        <TableCell
                          sx={{
                            color: theme.palette.mode === "dark" ? "common.white" : "text.primary",
                          }}
                        >
                          Venue
                        </TableCell>
                        <TableCell
                          sx={{
                            color: theme.palette.mode === "dark" ? "common.white" : "text.primary",
                          }}
                        >
                          City
                        </TableCell>
                        <TableCell
                          sx={{
                            color: theme.palette.mode === "dark" ? "common.white" : "text.primary",
                          }}
                        >
                          Date
                        </TableCell>
                        <TableCell
                          sx={{
                            color: theme.palette.mode === "dark" ? "common.white" : "text.primary",
                          }}
                        >
                          Time
                        </TableCell>
                        <TableCell
                          sx={{
                            color: theme.palette.mode === "dark" ? "common.white" : "text.primary",
                          }}
                        >
                          Payment
                        </TableCell>
                        <TableCell
                          sx={{
                            color: theme.palette.mode === "dark" ? "common.white" : "text.primary",
                          }}
                        >
                          Details
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            color: theme.palette.mode === "dark" ? "common.white" : "text.primary",
                          }}
                        >
                          Apply
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job._id}>
                          <TableCell sx={{ color: theme.palette.mode === "dark" ? "common.white" : "text.primary" }}>
                            {job.role}
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.mode === "dark" ? "common.white" : "text.primary" }}>
                            {job.venue}
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.mode === "dark" ? "common.white" : "text.primary" }}>
                            {job.location.city}
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.mode === "dark" ? "common.white" : "text.primary" }}>
                            {new Date(job.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.mode === "dark" ? "common.white" : "text.primary" }}>
                            {job.startTime} - {job.endTime}
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.mode === "dark" ? "common.white" : "text.primary" }}>
                            {job.paymentAmount} {job.currency} ({job.paymentType})
                          </TableCell>
                          <TableCell>
                            {job.description ? (
                              <IconButton
                                color="info"
                                onClick={() => handleOpenModal(job.description!)}
                                aria-label="view details"
                              >
                                <InfoIcon />
                              </IconButton>
                            ) : (
                              "-"
                            )}
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
                                  aria-label="apply to job"
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
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
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
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        color: theme.palette.mode === "dark" ? "common.white" : "text.primary",
                      }}
                    >
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
                      <Box sx={{ mt: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<InfoIcon />}
                          onClick={() => handleOpenModal(job.description!)}
                          sx={{
                            color: theme.palette.mode === "dark" ? "common.white" : "inherit",
                            borderColor: theme.palette.mode === "dark" ? "common.white" : "inherit",
                          }}
                        >
                          Details
                        </Button>
                      </Box>
                    )}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                        mt: job.description ? 2 : 1,
                      }}
                    >
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
        <Box sx={{ px: 2, mb: 2 }}>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{
              color: theme.palette.mode === "dark" ? "common.white" : "text.primary",
            }}
          >
            No jobs found.
          </Typography>
        </Box>
      )}

      {/* Pagination Controls */}
      <Box sx={{ display: { xs: "none", md: "flex" }, justifyContent: "center", mt: 2 }}>
        <Pagination
          count={Math.ceil(totalJobs / rowsPerPage)}
          page={page}
          onChange={(event, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* Job Description Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="job-description-modal-title"
        aria-describedby="job-description-modal-description"
      >
        <Box
          sx={{
            position: "absolute" as const,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", md: 400 },
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            maxHeight: "80vh",
            overflowY: "auto",
            color: theme.palette.mode === "dark" ? "common.white" : "text.primary",
          }}
        >
          <Typography id="job-description-modal-title" variant="h6" component="h2">
            Job Description
          </Typography>
          <Typography id="job-description-modal-description" sx={{ mt: 2 }}>
            {modalContent}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="contained" onClick={handleCloseModal}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </motion.div>
  );
}
