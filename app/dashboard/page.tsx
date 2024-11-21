"use client";

import { useState, useEffect, useContext, ReactElement } from "react";
import { Container, Typography, Box, Avatar, Button, Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import { AuthContext } from "@/contexts/AuthContext";
import { NotificationContext } from "@/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import PostJobModal from "../components/PostJobModal";
import DashboardSearchJobs from "../components/DashboardSearchJobs";

export default function DashboardPage(): ReactElement {
  const [isPostJobModalOpen, setPostJobModalOpen] = useState(false);
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const { notify } = useContext(NotificationContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect unauthenticated users to the login page
      notify("Please log in to access the dashboard.", "warning");
      router.push("/auth/login");
    }
  }, [isAuthenticated, loading, notify, router]);

  if (loading) {
    // Display a loading state while the authentication status is being determined
    return (
      <Typography variant="h6" align="center" sx={{ mt: 8 }}>
        Loading...
      </Typography>
    );
  }

  if (!isAuthenticated) {
    // Fallback in case redirection doesn't occur immediately
    router.push("/");
  }

  const handleOpenPostJobModal = () => {
    setPostJobModalOpen(true);
  };

  const handleClosePostJobModal = () => {
    setPostJobModalOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>

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
            <Button variant="contained" color="primary">
              Found a bug? Report Us!
            </Button>
          </Tooltip>
        </motion.div>
      </Box>

      {/* Post Job Modal */}
      <PostJobModal open={isPostJobModalOpen} onClose={handleClosePostJobModal} />

      {/* Search Jobs and Cards */}
      <DashboardSearchJobs />

      {/* Interactive Cards are now part of DashboardSearchJobs */}
    </Container>
  );
}
