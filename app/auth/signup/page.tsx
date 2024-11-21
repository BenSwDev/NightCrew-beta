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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { useRouter } from "next/navigation";
import axios from "@/utils/axios";
import { isAxiosError } from "axios";
import { AuthContext } from "@/contexts/AuthContext";
import { NotificationContext } from "@/contexts/NotificationContext";

const colorOptions = [
  "#FF5733",   "#F4D03F", "#8E44AD",
  "#1ABC9C", "#000000", "#3498DB",
];

export default function SignupPage(): ReactElement {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [avatarColor, setAvatarColor] = useState("#1976d2");
  const [loading, setLoading] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const { setUser } = useContext(AuthContext);
  const { notify } = useContext(NotificationContext);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !phone || !dob || !gender) {
      notify("Please fill in all fields.", "warning");
      return;
    }

    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    if (age < 18) {
      notify("You must be at least 18 years old to sign up.", "warning");
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
        phone,
        dob,
        gender,
        avatarColor,
      });
      setUser(response.data.user);
      notify("Signup successful!", "success");
      router.push("/dashboard");
    } catch (err: unknown) {
      if (isAxiosError(err)) {
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
          textAlign: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Sign Up
        </Typography>

        <Box
          sx={{ display: "flex", justifyContent: "center", my: 2 }}
          onClick={() => setColorPickerOpen(true)}
        >
          <Avatar
            sx={{
              bgcolor: avatarColor,
              width: 100,
              height: 100,
              fontSize: "90px",
              cursor: "pointer",
            }}
          >
            {name ? name[0].toUpperCase() : "A"}
          </Avatar>
        </Box>

        <Dialog open={colorPickerOpen} onClose={() => setColorPickerOpen(false)}>
          <DialogTitle>Pick Avatar Color</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              {colorOptions.map((color) => (
                <Grid item xs={4} key={color}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: color,
                      borderRadius: "50%",
                      cursor: "pointer",
                      border:
                        avatarColor === color
                          ? "3px solid black"
                          : "3px solid transparent",
                    }}
                    onClick={() => {
                      setAvatarColor(color);
                      setColorPickerOpen(false);
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
        </Dialog>

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
          <TextField
            label="Phone"
            type="tel"
            fullWidth
            required
            margin="normal"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            label="Date of Birth"
            type="date"
            fullWidth
            required
            margin="normal"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        <FormControl fullWidth required margin="normal">
          <InputLabel id="gender-select-label">Gender</InputLabel>
          <Select
            labelId="gender-select-label"
            id="gender-select"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Sign Up"}
          </Button>
        </form>
      </Box>
    </Container>
  );
}

