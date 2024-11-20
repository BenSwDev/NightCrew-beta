// app/auth/login/page.tsx
"use client";

import { useState, useContext, ReactElement } from "react";
import { TextField, Button, Container, Typography, Box, Link as MuiLink } from "@mui/material";
import { useRouter } from "next/navigation";
import axios from "@/utils/axios"; // Updated import
import { AuthContext } from "@/contexts/AuthContext";
import { NotificationContext } from "@/contexts/NotificationContext"; // Added for notifications
import { motion } from "framer-motion";

export default function LoginPage(): ReactElement {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useContext(AuthContext);
  const { notify } = useContext(NotificationContext); // Added for notifications
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!email || !password) {
      notify("Please enter both email and password.", "warning");
      return;
    }

    try {
      const response = await axios.post("/api/auth/login", { email, password });
      setUser(response.data.user);
      notify("Login successful!", "success"); // Notify success
      router.push("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.message || "Login failed. Please try again.";
        notify(errorMessage, "error"); // Notify error
      } else {
        notify("An unexpected error occurred.", "error");
      }
      console.error("Login error:", err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "background.paper",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Login to NightCrew
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={email !== "" && !/^\S+@\S+\.\S+$/.test(email)}
            helperText={
              email !== "" && !/^\S+@\S+\.\S+$/.test(email)
                ? "Please enter a valid email."
                : ""
            }
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, borderRadius: 2, padding: "10px" }}
          >
            Login
          </Button>
        </form>
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body2">
            Don’t have an account?{" "}
            <MuiLink href="/auth/signup" underline="hover">
              Sign up here.
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
