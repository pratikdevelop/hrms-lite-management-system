import { useState } from "react";
import API from "../api/api";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";

interface EmployeeFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const initialForm = {
  employee_id: "",
  full_name: "",
  email: "",
  department: "",
};

export default function EmployeeForm({ open, onClose, onSuccess }: EmployeeFormProps) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.employee_id || !form.full_name || !form.email || !form.department) {
      return setError("All fields are required.");
    }
    if (!validateEmail(form.email)) {
      return setError("Invalid email format.");
    }

    try {
      setLoading(true);
      await API.post("/employees/", form);
      setSuccess("Employee added successfully!");
      setForm(initialForm);
      onSuccess();
      // Auto close after short delay
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add employee.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return; // prevent close while submitting
    setForm(initialForm);
    setError("");
    setSuccess("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 },
      }}
    >
      {/* Title */}
      <DialogTitle sx={{ pb: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Add New Employee
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Fill in the details below to register a new employee
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={loading} size="small">
            ✕
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>

          {/* Alerts */}
          {error && (
            <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Fields */}
          <Box display="flex" flexDirection="column" gap={2.5}>
            <TextField
              label="Employee ID"
              name="employee_id"
              value={form.employee_id}
              onChange={handleChange}
              placeholder="e.g. EMP001"
              size="small"
              fullWidth
              required
            />

            <TextField
              label="Full Name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              size="small"
              fullWidth
              required
            />

            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. john@company.com"
              size="small"
              fullWidth
              required
            />

            <TextField
              label="Department"
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="e.g. Engineering"
              size="small"
              fullWidth
              required
            />
          </Box>
        </DialogContent>

        {/* Actions */}
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, minWidth: 120 }}
          >
            {loading ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={16} color="inherit" />
                <span>Adding...</span>
              </Box>
            ) : (
              "Add Employee"
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}