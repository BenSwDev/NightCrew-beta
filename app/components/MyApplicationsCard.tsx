// app/components/MyApplicationsCard.tsx
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
  Tooltip,
  CircularProgress,
  Paper,
} from "@mui/material";
import axios from "@/utils/axios";
import { NotificationContext } from "@/contexts/NotificationContext";
import DeleteIcon from "@mui/icons-material/Delete";
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
}

interface Application {
  _id: string;
  job: Job;
  appliedAt: string;
}

export default function MyApplicationsCard(): ReactElement {
  const { notify } = useContext(NotificationContext);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleOpenModal = async () => {
    setOpenModal(true);
    setLoading(true);
    try {
      const response = await axios.get("/api/applications/me", {
        params: { page: 1, limit: 100 },
      });
      setApplications(response.data.applications);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        notify("Failed to fetch your applications.", "error");
      } else {
        notify("An unexpected error occurred.", "error");
      }
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setApplications([]);
  };

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm("Are you sure you want to withdraw your application?")) return;
    try {
      await axios.delete(`/api/applications/${applicationId}`);
      notify("Application withdrawn successfully.", "success");
      // Remove the application from the state
      setApplications((prevApps) => prevApps.filter((app) => app._id !== applicationId));
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        notify(error.response?.data?.error || "Failed to withdraw application.", "error");
      } else {
        notify("An unexpected error occurred.", "error");
      }
      console.error("Error withdrawing application:", error);
    }
  };

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: applications.length > 3,
    speed: 500,
    slidesToShow: Math.min(applications.length, 3),
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024, // Tablet
        settings: {
          slidesToShow: Math.min(applications.length, 2),
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
    <>
      <Card sx={{ minWidth: 275, mb: 2 }}>
        <CardContent>
          <Typography variant="h5" component="div">
            My Applications
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            Manage your job applications
          </Typography>
        </CardContent>
        <CardActions>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="small" onClick={handleOpenModal} variant="contained">
              View My Applications
            </Button>
          </motion.div>
        </CardActions>
      </Card>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="my-applications-modal-title"
        aria-describedby="my-applications-modal-description"
      >
        <Box
          component={motion.div}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          sx={{
            position: "absolute" as const,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: '90%', md: '80%' },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            maxHeight: "80vh",
            overflowY: "auto",
            borderRadius: 2,
          }}
        >
          <Typography id="my-applications-modal-title" variant="h6" component="h2" gutterBottom>
            My Applications
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : applications.length > 0 ? (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              <Slider {...sliderSettings}>
                {applications.map((app) => (
                  <motion.div key={app._id} variants={itemFadeIn}>
                    <Box sx={{ p: 2 }}>
                      <Paper
                        elevation={3}
                        sx={{
                          p: 3,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          height: "100%",
                          borderRadius: 2,
                          boxShadow: 3,
                          position: "relative",
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          {app.job.role} at {app.job.venue}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          City: {app.job.location.city}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Date: {new Date(app.job.date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Time: {app.job.startTime} - {app.job.endTime}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Payment: {app.job.paymentAmount} {app.job.currency} ({app.job.paymentType})
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Applied At: {new Date(app.appliedAt).toLocaleString()}
                        </Typography>
                        <Box sx={{ mt: "auto", display: "flex", justifyContent: "flex-end", gap: 1 }}>
                          <Tooltip title="Withdraw Application">
                            <IconButton
                              color="error"
                              onClick={() => handleWithdraw(app._id)}
                              component={motion.button}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Paper>
                    </Box>
                  </motion.div>
                ))}
              </Slider>
            </motion.div>
          ) : (
            <Typography variant="body2" color="text.secondary">
              You have not applied for any jobs yet.
            </Typography>
          )}
        </Box>
      </Modal>
    </>
  );
}
