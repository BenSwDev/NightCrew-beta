// app/components/PostJobModal.tsx
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
  Autocomplete,
  Grid,
  InputAdornment,
  Typography,
  Box,
  Select,
  FormControl,
  CircularProgress,
} from "@mui/material";
import axios from "@/utils/axios";
import { NotificationContext } from "@/contexts/NotificationContext";

interface PostJobModalProps {
  open: boolean;
  onClose: () => void;
}

// Predefined payment types
const paymentTypes = [
  "Per Hour",
  "Fixed Price",
  "Tip-Based with Minimum Wage",
];

// Predefined currencies
const currencies = ["USD", "EUR", "ILS"];

export default function PostJobModal({ open, onClose }: PostJobModalProps): ReactElement {
  // State variables for form fields
  const [role, setRole] = useState<string>("");
  const [venue, setVenue] = useState<string>("");
  const [venueOptions, setVenueOptions] = useState<string[]>([]);
  const [venueInput, setVenueInput] = useState<string>("");
  const [loadingVenues, setLoadingVenues] = useState<boolean>(false);

  const [city, setCity] = useState<string>("");
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [cityInput, setCityInput] = useState<string>("");
  const [loadingCities, setLoadingCities] = useState<boolean>(false);

  const [street, setStreet] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [paymentType, setPaymentType] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<number | string>("");
  const [currency, setCurrency] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [roles, setRoles] = useState<string[]>([]);
  const { notify } = useContext(NotificationContext);

  // Fetch existing roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get("/api/roles");
        setRoles(response.data.roles);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    if (open) {
      fetchRoles();
    }
  }, [open]);

  // Fetch venues based on user input with debouncing
  useEffect(() => {
    const fetchVenues = async () => {
      if (venueInput.trim() === "") {
        setVenueOptions([]);
        return;
      }
      setLoadingVenues(true);
      try {
        const response = await axios.get("/api/venues", {
          params: { search: venueInput },
        });
        setVenueOptions(response.data.venues.map((venue: any) => venue.name));
      } catch (error) {
        console.error("Error fetching venues:", error);
      } finally {
        setLoadingVenues(false);
      }
    };
    fetchVenues();
  }, [venueInput]);

  // Fetch cities based on user input with debouncing
  useEffect(() => {
    const fetchCities = async () => {
      if (cityInput.trim() === "") {
        setCityOptions([]);
        return;
      }
      setLoadingCities(true);
      try {
        const response = await axios.get("/api/cities", {
          params: { search: cityInput },
        });
        setCityOptions(response.data.cities);
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [cityInput]);

  // Handle form submission
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

    // Additional validations can be added here (e.g., date and time formats)

    try {
      // Check if venue exists, if not, add it
      if (venueOptions.includes(venue)) {
        // Venue exists, no need to add
        console.log("Venue exists:", venue);
      } else {
        // Venue does not exist, add it
        await axios.post("/api/venues", { name: venue });
        console.log("New venue added:", venue);
        // Optionally, refresh venue options after adding
        setVenueOptions((prev) => [...prev, venue]);
      }

      // Check if city exists, if not, add it
      if (cityOptions.includes(city)) {
        // City exists, no need to add
        console.log("City exists:", city);
      } else {
        // City does not exist, add it
        await axios.post("/api/cities", { name: city });
        console.log("New city added:", city);
        // Optionally, refresh city options after adding
        setCityOptions((prev) => [...prev, city]);
      }

      const payload = {
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
      };

      const response = await axios.post("/api/jobs", payload);
      console.log("Job posted successfully:", response.data);
      onClose();
      resetForm();
      notify("Job posted successfully!", "success");
    } catch (error: any) {
      console.error("Error posting job:", error);
      notify(
        error.response?.data?.error || "Failed to post job. Please try again.",
        "error"
      );
    }
  };

  // Reset form fields
  const resetForm = () => {
    setRole("");
    setVenue("");
    setVenueInput("");
    setCity("");
    setCityInput("");
    setStreet("");
    setNumber("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setPaymentType("");
    setPaymentAmount("");
    setCurrency("");
    setDescription("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Post a New Job</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Section 1: Role */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Role
              </Typography>
              <Autocomplete
                freeSolo
                options={roles}
                value={role}
                onChange={(event, newValue) => {
                  setRole(newValue || "");
                }}
                onInputChange={(event, newInputValue) => {
                  setRole(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select or Add Role"
                    placeholder="Type to search or add a new role"
                    required
                  />
                )}
              />
            </Grid>

            {/* Section 2: Venue */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Venue
              </Typography>
              <Autocomplete
                freeSolo
                options={venueOptions}
                value={venue}
                onChange={(event, newValue) => {
                  setVenue(newValue || "");
                }}
                onInputChange={(event, newInputValue) => {
                  setVenueInput(newInputValue);
                  setVenue(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Venue Name"
                    placeholder="Type to search or add a new venue"
                    required
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingVenues ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Section 3: Location */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Location
              </Typography>
              <Grid container spacing={2}>
                {/* City */}
                <Grid item xs={12} sm={4}>
                  <Autocomplete
                    freeSolo
                    options={cityOptions}
                    value={city}
                    onChange={(event, newValue) => {
                      setCity(newValue || "");
                    }}
                    onInputChange={(event, newInputValue) => {
                      setCityInput(newInputValue);
                      setCity(newInputValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="City"
                        placeholder="Type to search or add a new city"
                        required
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingCities ? <CircularProgress size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
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

            {/* Section 4: Date & Time */}
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

            {/* Section 5: Payment */}
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
                    {paymentTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
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

            {/* Section 6: Description */}
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
        <Button onClick={onClose} variant="outlined" color="secondary" disabled={false}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Post Job
        </Button>
      </DialogActions>
    </Dialog>
  );
}
