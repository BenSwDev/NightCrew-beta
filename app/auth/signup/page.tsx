// app/auth/signup/page.tsx
"use client";

import { useState, useContext, ReactElement } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";
import axios from "@/utils/axios";
import { AuthContext } from "@/contexts/AuthContext";
import { NotificationContext } from "@/contexts/NotificationContext";

export default function SignupPage(): ReactElement {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const { setUser } = useContext(AuthContext);
  const { notify } = useContext(NotificationContext);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      notify("Please fill in all fields.", "warning");
      return;
    }

    if (password.length < 6) {
      notify("Password must be at least 6 characters.", "warning");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/auth/signup", {
        name,
        email,
        password,
      });
      setUser(response.data.user);
      notify("Signup successful!", "success");
      router.push("/dashboard"); // Redirect to dashboard after signup
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.message || "Signup failed. Please try again.";
        notify(errorMessage, "error");
      } else {
        notify("An unexpected error occurred.", "error");
      }
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box
        sx={{
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "background.paper",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Sign Up
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            type="text"
            fullWidth
            required
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            sx={{ mt: 2 }}
            disabled={loading} // Disable button during loading
          >
            {loading ? <CircularProgress size={24} /> : "Sign Up"}
          </Button>
        </form>
      </Box>
    </Container>
  );
}
