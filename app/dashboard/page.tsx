// app/dashboard/page.tsx
"use client";

import { useState, useEffect, useContext, ReactElement } from "react";
import { Container, Typography, Box, Grid, Paper, Avatar, Button, Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import { AuthContext } from "@/contexts/AuthContext";
import { NotificationContext } from "@/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import PostJobModal from "../components/PostJobModal";
import DashboardSearchJobs from "../components/DashboardSearchJobs";

export default function DashboardPage(): ReactElement {
  const [isPostJobModalOpen, setPostJobModalOpen] = useState(false);
  const { user, isAuthenticated, loading } = useContext(AuthContext); // Destructure loading
  const { notify } = useContext(NotificationContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) { // Check if not loading before redirecting
      notify("Please log in to access the dashboard.", "warning");
      router.push("/auth/login");
    }
  }, [isAuthenticated, loading]);

  if (loading) { // Show loading state
    return (
      <Typography variant="h6" align="center" sx={{ mt: 4 }}>
        Loading...
      </Typography>
    );
  }

  if (!isAuthenticated) { // After loading, if not authenticated, don't render dashboard
    return null; // Optionally, you can return a placeholder or nothing
  }

  const handleOpenPostJobModal = () => {
    setPostJobModalOpen(true);
  };

  const handleClosePostJobModal = () => {
    setPostJobModalOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
      {/* User Information */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 6,
          p: 3,
          borderRadius: 2,
          backgroundColor: "background.paper",
          boxShadow: 3,
        }}
      >
        {user ? (
          <>
            <Avatar src={user.avatarUrl} alt={user.name} sx={{ width: 80, height: 80, mr: 3 }} />
            <Box>
              <Typography variant="h5" gutterBottom>
                Hello, {user.name}!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome back to NightCrew. Search your next job or post one to hire new employees.
              </Typography>
            </Box>
          </>
        ) : (
          <Typography variant="h6" color="error">
            User data is unavailable.
          </Typography>
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.3 }}>
          <Tooltip title="Post New Job">
            <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={handleOpenPostJobModal}>
              Post Job
            </Button>
          </Tooltip>
        </motion.div>
        <Box sx={{ width: 16 }} /> {/* Spacer */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.3 }}>
          <Tooltip title="View Notifications">
            <Button variant="outlined" color="primary">
              View Notifications
            </Button>
          </Tooltip>
        </motion.div>
      </Box>

      {/* Post Job Modal */}
      <PostJobModal
        open={isPostJobModalOpen}
        onClose={handleClosePostJobModal}
      />

      {/* Search Jobs and Cards */}
      <DashboardSearchJobs />

      {/* Interactive Cards are now part of DashboardSearchJobs */}
    </Container>
  );
}
