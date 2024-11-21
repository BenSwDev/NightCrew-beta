// app/components/MyJobsCard.tsx
"use client";

import React, { useState, useContext, ReactElement } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Modal,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Avatar,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import axios from "@/utils/axios";
import { NotificationContext } from "@/contexts/NotificationContext";
import EditJobDialog from "./EditJobDialog";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PeopleIcon from "@mui/icons-material/People";
import CloseIcon from "@mui/icons-material/Close";
import Slider from "react-slick";
import { FaWhatsapp } from "react-icons/fa";
import { isAxiosError } from "axios";

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
}

interface Applicant {
  _id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: string; // Assuming dateOfBirth is a string
  gender?: string;
  status: "Applied" | "Connected" | "Declined";
}


interface JobApplicants {
  job: {
    _id: string;
    role: string;
    venue: string;
    date: string;
  };
  applicants: Applicant[];
}

export default function MyJobsCard(): ReactElement {
  const { notify } = useContext(NotificationContext);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedJobApplicants, setSelectedJobApplicants] = useState<JobApplicants | null>(null);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [applicantsModalOpen, setApplicantsModalOpen] = useState<boolean>(false);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // Helper function to calculate age from date of birth
  function calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  // Helper function to check if a job is relevant based on current date and time
  const isJobRelevant = (job: Job): boolean => {
    const jobDateTime = new Date(`${job.date}T${job.endTime}`);
    const now = new Date();
    return jobDateTime >= now;
  };

  const handleOpenModal = async () => {
    setOpenModal(true);
    setLoading(true);
    try {
      const response = await axios.get("/api/my-jobs", {
        params: { page: 1, limit: 100 },
      });

      if (response.data && response.data.jobs && response.data.jobs.length > 0) {
        // Filter jobs to show only relevant ones
        const relevantJobs: Job[] = response.data.jobs.filter(isJobRelevant);
        setJobs(relevantJobs);
      } else {
        setJobs([]); // Ensures no stale state if no jobs are returned
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error("Error fetching my jobs:", error.response?.data || error.message);
        notify("Failed to fetch your jobs.", "error");
      } else {
        console.error("Unknown error:", error);
        notify("An unexpected error occurred.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setJobs([]);
    setSelectedJobApplicants(null);
    setApplicantsModalOpen(false);
  };

  const handleEdit = (job: Job) => {
    setEditJob(job);
    setEditDialogOpen(true);
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) return;

    try {
      await axios.delete(`/api/jobs/${jobId}`);
      notify("Job deleted successfully.", "success");
      // Remove the job from the state
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error("Error deleting job:", error.response?.data || error.message);
        notify(error.response?.data?.error || "Failed to delete job.", "error");
      } else {
        console.error("Unknown error:", error);
        notify("An unexpected error occurred.", "error");
      }
    }
  };

  const handleViewApplicants = async (jobId: string) => {
    // Toggle the applicants view if the same job is clicked again
    if (selectedJobApplicants?.job._id === jobId) {
      setSelectedJobApplicants(null);
      return;
    }

    try {
      const response = await axios.get("/api/my-jobs/applicants", {
        params: { jobId },
      });
      const jobApplicants = response.data.jobApplicants.find((ja: JobApplicants) => ja.job._id === jobId);
      if (jobApplicants) {
        setSelectedJobApplicants(jobApplicants);
        setApplicantsModalOpen(true);
      } else {
        notify("No applicants found for this job.", "info");
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error("Error fetching applicants:", error.response?.data || error.message);
        notify("Failed to fetch applicants.", "error");
      } else {
        console.error("Unknown error:", error);
        notify("An unexpected error occurred.", "error");
      }
    }
  };

  // Updated handleConnect to redirect to applicant's WhatsApp with pre-filled message
  const handleConnect = (applicant: Applicant) => {
    if (!applicant.phone) {
      notify("Applicant does not have a phone number.", "error");
      return;
    }

    // Remove any non-digit characters from the phone number
    const phoneNumber = applicant.phone.replace(/\D/g, "");
    const message = encodeURIComponent("Hi, I saw you are interested in the job. Is this a good time to talk?");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleDecline = async (applicationId: string) => {
    try {
      await axios.put("/api/my-jobs/applicants", {
        jobId: selectedJobApplicants?.job._id,
        applicantId: applicationId,
        action: "decline",
      });
      notify("Applicant declined successfully.", "success");
      // Refresh the applicants list
      if (selectedJobApplicants) {
        handleViewApplicants(selectedJobApplicants.job._id);
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error("Error declining applicant:", error.response?.data || error.message);
        notify(error.response?.data?.error || "Failed to decline applicant.", "error");
      } else {
        console.error("Unknown error:", error);
        notify("An unexpected error occurred.", "error");
      }
    }
  };

  // Slider settings for jobs and applicants
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <>
      <Card sx={{ minWidth: 275, mb: 2 }}>
        <CardContent>
          <Typography variant="h5" component="div">
            My Jobs
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            Manage your posted jobs
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={handleOpenModal}>
            View My Jobs
          </Button>
        </CardActions>
      </Card>

      {/* Jobs Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="my-jobs-modal-title"
        aria-describedby="my-jobs-modal-description"
      >
        <Box
          sx={{
            position: "absolute" as const,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", md: "80%" },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography id="my-jobs-modal-title" variant="h6" component="h2">
              My Posted Jobs
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : jobs.length > 0 ? (
            isDesktop ? (
              // Desktop View: Table
              <TableContainer component={Paper}>
                <Table aria-label="my jobs table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Role</TableCell>
                      <TableCell>Venue</TableCell>
                      <TableCell>City</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Payment</TableCell>
                      <TableCell align="center">Applicants</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jobs.map((job) => (
                      <React.Fragment key={job._id}>
                        <TableRow hover>
                          <TableCell>{job.role}</TableCell>
                          <TableCell>{job.venue}</TableCell>
                          <TableCell>{job.location.city}</TableCell>
                          <TableCell>{job.date}</TableCell>
                          <TableCell>
                            {job.startTime} - {job.endTime}
                          </TableCell>
                          <TableCell>
                            {job.paymentAmount} {job.currency} ({job.paymentType})
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              startIcon={<PeopleIcon />}
                              onClick={() => handleViewApplicants(job._id)}
                            >
                              {selectedJobApplicants?.job._id === job._id
                                ? `${selectedJobApplicants.applicants.length} Applicants`
                                : "View Applicants"}
                            </Button>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Edit Job">
                              <IconButton color="primary" onClick={() => handleEdit(job)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Job">
                              <IconButton color="error" onClick={() => handleDelete(job._id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                        {/* Applicants Table */}
                        {selectedJobApplicants?.job._id === job._id && (
                          <TableRow>
                            <TableCell colSpan={8} sx={{ padding: 0 }}>
                              <Box sx={{ padding: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                  Applicants for {selectedJobApplicants.job.role} at {selectedJobApplicants.job.venue} on{" "}
                                  {selectedJobApplicants.job.date}
                                </Typography>
                                {selectedJobApplicants.applicants.length > 0 ? (
                                  <Table size="small" aria-label="applicants table">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Applicant</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Phone</TableCell>
                                        <TableCell>Age</TableCell>
                                        <TableCell>Gender</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {selectedJobApplicants.applicants.map((applicant) => (
                                        <TableRow key={applicant._id}>
                                          <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                              <Avatar
                                                src={applicant.avatarUrl}
                                                alt={applicant.name}
                                                sx={{ mr: 2 }}
                                              >
                                                {applicant.name.charAt(0)}
                                              </Avatar>
                                              {applicant.name}
                                            </Box>
                                          </TableCell>
                                          <TableCell>{applicant.email || "N/A"}</TableCell>
                                          <TableCell>{applicant.phone || "N/A"}</TableCell>
                                          <TableCell>
                                            {applicant.dateOfBirth ? calculateAge(applicant.dateOfBirth) : "N/A"}
                                          </TableCell>
                                          <TableCell>{applicant.gender || "N/A"}</TableCell>
                                          <TableCell>
                                            {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                                          </TableCell>
                                          <TableCell align="center">
                                                <Tooltip title="Connect">
                                                  <Button
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<FaWhatsapp />}
                                                    onClick={() => handleConnect(applicant)}
                                                    sx={{ mr: 1 }}
                                                  >
                                                    Connect
                                                  </Button>
                                                </Tooltip>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No applicants for this job.
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              // Tablet/Mobile View: Slider of Job Cards
              <Slider {...sliderSettings}>
                {jobs.map((job) => (
                  <Box key={job._id} sx={{ p: 2 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" component="div">
                          {job.role}
                        </Typography>
                        <Typography color="text.secondary">
                          {job.venue}, {job.location.city}
                        </Typography>
                        <Typography>Date: {job.date}</Typography>
                        <Typography>
                          Time: {job.startTime} - {job.endTime}
                        </Typography>
                        <Typography>
                          Payment: {job.paymentAmount} {job.currency} ({job.paymentType})
                        </Typography>
                        {job.description && (
                          <Typography sx={{ mt: 1.5 }} color="text.secondary">
                            {job.description}
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions>
                        <Tooltip title="Edit Job">
                          <IconButton color="primary" onClick={() => handleEdit(job)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Job">
                          <IconButton color="error" onClick={() => handleDelete(job._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <Button
                          variant="outlined"
                          startIcon={<PeopleIcon />}
                          onClick={() => handleViewApplicants(job._id)}
                        >
                          View Applicants
                        </Button>
                      </CardActions>
                      {/* Applicants Slider */}
                      {selectedJobApplicants?.job._id === job._id && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Applicants for {selectedJobApplicants.job.role} at {selectedJobApplicants.job.venue} on{" "}
                            {selectedJobApplicants.job.date}
                          </Typography>
                          {selectedJobApplicants.applicants.length > 0 ? (
                            <Slider {...sliderSettings}>
                              {selectedJobApplicants.applicants.map((applicant) => (
                                <Box key={applicant._id} sx={{ p: 2 }}>
                                  <Card>
                                    <CardContent>
                                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                        <Avatar
                                          src={applicant.avatarUrl}
                                          alt={applicant.name}
                                          sx={{ width: 56, height: 56, mr: 2 }}
                                        >
                                          {applicant.name.charAt(0)}
                                        </Avatar>
                                        <Box>
                                          <Typography variant="h6">{applicant.name}</Typography>
                                          <Typography variant="body2" color="text.secondary">
                                            {applicant.email || "No Email Provided"}
                                          </Typography>
                                        </Box>
                                      </Box>
                                      <Typography>
                                        Age: {applicant.dateOfBirth ? calculateAge(applicant.dateOfBirth) : "N/A"}
                                      </Typography>
                                      <Typography>Phone: {applicant.phone || "N/A"}</Typography>
                                      <Typography>Gender: {applicant.gender || "N/A"}</Typography>
                                    </CardContent>
                                    <CardActions>
                                          <Tooltip title="Connect">
                                            <Button
                                              variant="contained"
                                              color="success"
                                              startIcon={<FaWhatsapp />}
                                              onClick={() => handleConnect(applicant)}
                                              sx={{ mr: 1 }}
                                            >
                                              Connect
                                            </Button>
                                          </Tooltip>
                                    </CardActions>
                                  </Card>
                                </Box>
                              ))}
                            </Slider>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No applicants for this job.
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Card>
                  </Box>
                ))}
              </Slider>
            )
          ) : (
            <Typography variant="body2" color="text.secondary">
              You have not posted any jobs yet.
            </Typography>
          )}

          {/* Applicants Modal for Tablet/Mobile View */}
          {!isDesktop && selectedJobApplicants && (
            <Modal
              open={applicantsModalOpen}
              onClose={() => setApplicantsModalOpen(false)}
              aria-labelledby="applicants-modal-title"
              aria-describedby="applicants-modal-description"
            >
              <Box
                sx={{
                  position: "absolute" as const,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: { xs: "95%", sm: "80%" },
                  bgcolor: "background.paper",
                  boxShadow: 24,
                  p: 4,
                  maxHeight: "90vh",
                  overflowY: "auto",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography id="applicants-modal-title" variant="h6" component="h2">
                    Applicants for {selectedJobApplicants.job.role}
                  </Typography>
                  <IconButton onClick={() => setApplicantsModalOpen(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                {selectedJobApplicants.applicants.length > 0 ? (
                  <Slider {...sliderSettings}>
                    {selectedJobApplicants.applicants.map((applicant) => (
                      <Box key={applicant._id} sx={{ p: 2 }}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                              <Avatar
                                src={applicant.avatarUrl}
                                alt={applicant.name}
                                sx={{ width: 56, height: 56, mr: 2 }}
                              >
                                {applicant.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="h6">{applicant.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {applicant.email || "No Email Provided"}
                                </Typography>
                              </Box>
                            </Box>
                            <Typography>
                              Age: {applicant.dateOfBirth ? calculateAge(applicant.dateOfBirth) : "N/A"}
                            </Typography>
                            <Typography>Phone: {applicant.phone || "N/A"}</Typography>
                            <Typography>Gender: {applicant.gender || "N/A"}</Typography>
                          </CardContent>
                          <CardActions>
                            {applicant.status === "Applied" && (
                              <>
                                <Tooltip title="Connect">
                                  <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<FaWhatsapp />}
                                    onClick={() => handleConnect(applicant)}
                                    sx={{ mr: 1 }}
                                  >
                                    Connect
                                  </Button>
                                </Tooltip>
                                <Tooltip title="Decline">
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleDecline(applicant._id)}
                                  >
                                    Decline
                                  </Button>
                                </Tooltip>
                              </>
                            )}
                          </CardActions>
                        </Card>
                      </Box>
                    ))}
                  </Slider>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No applicants for this job.
                  </Typography>
                )}
              </Box>
            </Modal>
          )}
        </Box>
      </Modal>

      {/* Edit Job Dialog */}
      {editJob && (
        <EditJobDialog
          job={editJob}
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onJobUpdated={() => {
            notify("Job updated successfully.", "success");
            // Optionally, refresh the jobs list or remove/update the job in the state
            setJobs((prevJobs) =>
              prevJobs.map((j) => (j._id === editJob._id ? editJob : j))
            );
          }}
        />
      )}
    </>
  );
}
