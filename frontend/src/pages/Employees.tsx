import { useEffect, useState } from "react";
import API from "../api/api";
import EmployeeForm from "../components/EmployeeForm";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  InputAdornment,
} from "@mui/material";

export interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
}

const DEPT_COLORS: Record<string, { bg: string; color: string }> = {
  Engineering:  { bg: "#dbeafe", color: "#1d4ed8" },
  HR:           { bg: "#ede9fe", color: "#6d28d9" },
  Finance:      { bg: "#dcfce7", color: "#15803d" },
  Marketing:    { bg: "#ffedd5", color: "#c2410c" },
  Sales:        { bg: "#fef9c3", color: "#a16207" },
  Operations:   { bg: "#fee2e2", color: "#b91c1c" },
};

function DeptChip({ dept }: { dept: string }) {
  const style = DEPT_COLORS[dept] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <Chip
      label={dept}
      size="small"
      sx={{
        bgcolor: style.bg,
        color: style.color,
        fontWeight: 600,
        fontSize: 11,
      }}
    />
  );
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const fetchEmployees = async (): Promise<void> => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/employees/");
      setEmployees(res.data.data);
    } catch {
      setError("Failed to load employees. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employeeId: string): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      setDeletingId(employeeId);
      await API.delete(`/employees/${employeeId}`);
      fetchEmployees();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete employee.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Search filter — matches ID, name, email, or department
  const filteredEmployees = employees.filter((emp) => {
    const q = search.toLowerCase();
    return (
      emp.full_name.toLowerCase().includes(q) ||
      emp.employee_id.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q)
    );
  });

  return (
    <Box>
      {/* Page Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color="text.primary">
            👥 Employees
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {employees.length} employee{employees.length !== 1 ? "s" : ""} registered
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => setModalOpen(true)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 3,
          }}
        >
          + Add Employee
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <Box mb={2}>
        <TextField
          placeholder="Search by name, ID, email or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: { xs: "100%", sm: 340 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">🔍</InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={8} gap={2}>
          <CircularProgress size={28} />
          <Typography color="text.secondary">Loading employees...</Typography>
        </Box>
      ) : filteredEmployees.length === 0 ? (
        <Box display="flex" flexDirection="column" alignItems="center" py={8}>
          <Typography fontSize={40}>👤</Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            {search ? "No employees match your search" : "No employees found. Add one to get started."}
          </Typography>
        </Box>
      ) : (
        <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  {["Employee ID", "Name", "Email", "Department", "Actions"].map((col) => (
                    <TableCell
                      key={col}
                      align={col === "Actions" ? "center" : "left"}
                      sx={{
                        fontWeight: 700,
                        color: "text.secondary",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow
                    key={emp.id}
                    hover
                    sx={{ "&:last-child td": { border: 0 } }}
                  >
                    {/* Employee ID */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          bgcolor: "grey.100",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          display: "inline-block",
                          fontFamily: "monospace",
                          fontSize: 12,
                        }}
                      >
                        {emp.employee_id}
                      </Typography>
                    </TableCell>

                    {/* Name with Avatar */}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 700,
                            fontSize: 13,
                            flexShrink: 0,
                          }}
                        >
                          {emp.full_name.charAt(0).toUpperCase()}
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {emp.full_name}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Email */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {emp.email}
                      </Typography>
                    </TableCell>

                    {/* Department */}
                    <TableCell>
                      <DeptChip dept={emp.department} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(emp.employee_id)}
                        disabled={deletingId === emp.employee_id}
                        sx={{ textTransform: "none", borderRadius: 2, fontSize: 12, minWidth: 80 }}
                      >
                        {deletingId === emp.employee_id ? (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <CircularProgress size={12} color="error" />
                            <span>Deleting</span>
                          </Box>
                        ) : (
                          "🗑 Delete"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              bgcolor: "grey.50",
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Showing {filteredEmployees.length} of {employees.length} employees
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Add Employee Modal */}
      <EmployeeForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchEmployees}
      />
    </Box>
  );
}