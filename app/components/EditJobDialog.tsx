// app/components/EditJobDialog.tsx
"use client";

import { useState, useEffect, useContext, ReactElement } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Grid,
  InputAdornment,
  Typography,
  Box,
  Select,
  FormControl,
} from "@mui/material";
import axios from "@/utils/axios";
import { NotificationContext } from "@/contexts/NotificationContext";

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

interface EditJobDialogProps {
  job: Job;
  open: boolean;
  onClose: () => void;
  onJobUpdated: () => void;
}

export default function EditJobDialog({
  job,
  open,
  onClose,
  onJobUpdated,
}: EditJobDialogProps): ReactElement {
  const [role, setRole] = useState<string>(job.role);
  const [venue, setVenue] = useState<string>(job.venue);
  const [city, setCity] = useState<string>(job.location.city);
  const [street, setStreet] = useState<string>(job.location.street || "");
  const [number, setNumber] = useState<string>(job.location.number || "");
  const [date, setDate] = useState<string>(job.date);
  const [startTime, setStartTime] = useState<string>(job.startTime);
  const [endTime, setEndTime] = useState<string>(job.endTime);
  const [paymentType, setPaymentType] = useState<string>(job.paymentType);
  const [paymentAmount, setPaymentAmount] = useState<number | string>(
    job.paymentAmount
  );
  const [currency, setCurrency] = useState<string>(job.currency);
  const [description, setDescription] = useState<string>(
    job.description || ""
  );

  const { notify } = useContext(NotificationContext);

  const [loading, setLoading] = useState<boolean>(false); // Added loading state

  useEffect(() => {
    setRole(job.role);
    setVenue(job.venue);
    setCity(job.location.city);
    setStreet(job.location.street || "");
    setNumber(job.location.number || "");
    setDate(job.date);
    setStartTime(job.startTime);
    setEndTime(job.endTime);
    setPaymentType(job.paymentType);
    setPaymentAmount(job.paymentAmount);
    setCurrency(job.currency);
    setDescription(job.description || "");
  }, [job]);

  const handleSubmit = async () => {
    // Comprehensive client-side validation
    if (
      !role.trim() ||
      !venue.trim() ||
      !city.trim() ||
      !date.trim() ||
      !startTime.trim() ||
      !endTime.trim() ||
      !paymentType.trim() ||
      !paymentAmount ||
      !currency.trim()
    ) {
      notify("Please fill in all required fields.", "warning");
      return;
    }

    setLoading(true); // Start loading

    try {
      await axios.put(`/api/jobs/${job._id}`, {
        role: role.trim(),
        venue: venue.trim(),
        location: {
          city: city.trim(),
          street: street.trim() || undefined,
          number: number.trim() || undefined,
        },
        date,
        startTime,
        endTime,
        paymentType,
        paymentAmount: Number(paymentAmount),
        currency,
        description: description.trim() || undefined,
      });
      notify("Job updated successfully.", "success");
      onJobUpdated();
      onClose();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        notify(
          error.response?.data?.error || "Failed to update job.",
          "error"
        );
      } else {
        notify("An unexpected error occurred.", "error");
      }
      console.error("Error updating job:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Job</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Role */}
            <Grid item xs={12}>
              <TextField
                label="Role"
                fullWidth
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </Grid>

            {/* Venue */}
            <Grid item xs={12}>
              <TextField
                label="Venue"
                fullWidth
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Location
              </Typography>
              <Grid container spacing={2}>
                {/* City */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="City"
                    fullWidth
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </Grid>

                {/* Street */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Street"
                    fullWidth
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Optional"
                  />
                </Grid>

                {/* Number */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Number"
                    fullWidth
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Optional"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Date & Time */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Date & Time
              </Typography>
              <Grid container spacing={2}>
                {/* Date */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Date"
                    type="date"
                    fullWidth
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                {/* Start Time */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Start Time"
                    type="time"
                    fullWidth
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                {/* End Time */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="End Time"
                    type="time"
                    fullWidth
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Payment */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Payment
              </Typography>
              <Grid container spacing={2} alignItems="center">
                {/* Payment Type */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Payment Type"
                    select
                    fullWidth
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    required
                  >
                    <MenuItem value="Per Hour">Per Hour</MenuItem>
                    <MenuItem value="Fixed Price">Fixed Price</MenuItem>
                    <MenuItem value="With Tips">With Tips</MenuItem>
                    <MenuItem value="Tip-Based with Minimum Wage">
                      Tip-Based with Minimum Wage
                    </MenuItem>
                  </TextField>
                </Grid>

                {/* Payment Amount */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Payment Amount"
                    type="number"
                    fullWidth
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FormControl variant="standard" sx={{ minWidth: 60 }}>
                            <Select
                              value={currency}
                              onChange={(e) => setCurrency(e.target.value)}
                              displayEmpty
                              inputProps={{ "aria-label": "Currency" }}
                              required
                            >
                              <MenuItem value="" disabled>
                                $
                              </MenuItem>
                              {currencies.map((curr) => (
                                <MenuItem key={curr} value={curr}>
                                  {curr === "USD"
                                    ? "$"
                                    : curr === "EUR"
                                    ? "€"
                                    : "₪"}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <TextField
                label="Job Description"
                multiline
                rows={4}
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a brief description of the job (optional)"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          variant="outlined"
          color="secondary"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Job"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
