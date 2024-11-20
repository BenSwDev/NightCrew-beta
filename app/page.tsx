// app/page.tsx
"use client";

import { ReactElement } from "react";
import { Container, Typography, Box, Button, Stack } from "@mui/material";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage(): ReactElement {
  return (
    <Container maxWidth="md" sx={{ textAlign: "center", mt: 8 }}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to MyApp
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
          A perfectly responsive Next.js application with modern features.
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button variant="contained" color="primary" component={Link} href="/auth/login">
          Login
        </Button>
        <Button variant="outlined" color="secondary" component={Link} href="/auth/signup">
          Sign Up
        </Button>
      </Stack>
    </Container>
  );
}
