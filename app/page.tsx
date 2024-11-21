"use client";

import { useEffect, ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Container, Typography, Box, Button, Stack } from "@mui/material";
import Link from "next/link";
import { motion } from "framer-motion";
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

export default function HomePage(): ReactElement {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    } else {
       router.push("/auth/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 8 }}>
        Loading...
      </Typography>
    );
  }

  return (
    <Container maxWidth="md" sx={{ textAlign: "center", mt: 8 }}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to NightCrew Application
        </Typography>
      </Box>

      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        sx={{ mb: 4 }}
      >
        <Typography variant="h6" color="text.secondary">
          Search your next job or Post one to hire new employees :)
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button variant="contained" color="primary" component={Link} href="/auth/login">
          Login
        </Button>
        <Button variant="contained" color="secondary"   sx={{
                                                          "&:hover": {
                                                            backgroundColor: theme => theme.palette.secondary.main, // Use secondary color on hover
                                                            color: theme => theme.palette.secondary.contrastText, // Ensure text color is consistent
                                                          },
                                                        }}
                                                        component={Link} href="/auth/signup">
          Sign Up
        </Button>
      </Stack>
    </Container>
  );
}
