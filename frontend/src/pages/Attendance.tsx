import { useEffect, useState } from "react";
import API from "../api/api";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";

// ✅ Safe SelectChangeEvent import that works across all MUI versions
type SelectChangeEvent = { target: { value: string } };

interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
}

interface Attendance {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  status: "Present" | "Absent";
}

export default function Attendance() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [employeeId, setEmployeeId] = useState<string>("");
  const [filterEmployee, setFilterEmployee] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [status, setStatus] = useState<"Present" | "Absent">("Present");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await API.get("/employees/");
      setEmployees(res.data.data);
    } catch {
      console.error("Failed to fetch employees");
    }
  };

  const fetchAttendance = async () => {
    try {
      setTableLoading(true);
      setError("");
      const res = await API.get("/attendance/");
      setRecords(res.data.data);
    } catch {
      setError("Failed to load attendance records. Please try again.");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      setError("Please select an employee.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      setSuccessMsg("");
      await API.post("/attendance/", { employee_id: employeeId, date, status });
      setSuccessMsg("Attendance marked successfully!");
      setEmployeeId("");
      setStatus("Present");
      fetchAttendance();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to mark attendance.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this attendance record?")) return;
    try {
      setDeletingId(id);
      await API.delete(`/attendance/${id}`);
      fetchAttendance();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete record.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredRecords = records.filter((rec) =>
    filterEmployee ? rec.employee_id === filterEmployee : true
  );

  return (
    <Box>
      {/* Page Header */}
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          📋 Attendance
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg("")} sx={{ mb: 2 }}>
          {successMsg}
        </Alert>
      )}

      {/* Mark Attendance Form */}
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Mark Attendance
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            alignItems: { xs: "stretch", md: "flex-end" },
          }}
        >
          {/* Employee Select */}
          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel>Select Employee</InputLabel>
            <Select
              value={employeeId}
              label="Select Employee"
              onChange={(e: SelectChangeEvent) => setEmployeeId(e.target.value)}
            >
              <MenuItem value="">
                <em>Select Employee</em>
              </MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.employee_id}>
                  {emp.full_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Date Picker */}
          <TextField
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            InputLabelProps={{ shrink: true }}
          />

          {/* Status Select */}
          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e: SelectChangeEvent) =>
                setStatus(e.target.value as "Present" | "Absent")
              }
            >
              <MenuItem value="Present">✅ Present</MenuItem>
              <MenuItem value="Absent">❌ Absent</MenuItem>
            </Select>
          </FormControl>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              whiteSpace: "nowrap",
              flexShrink: 0,
              minWidth: 150,
            }}
          >
            {submitting ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={16} color="inherit" />
                <span>Saving...</span>
              </Box>
            ) : (
              "Mark Attendance"
            )}
          </Button>
        </Box>
      </Paper>

      {/* Records Header + Filter */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexWrap="wrap"
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            Attendance Records
          </Typography>
          <Chip label={filteredRecords.length} size="small" sx={{ fontWeight: 600 }} />
        </Box>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Employee</InputLabel>
          <Select
            value={filterEmployee}
            label="Filter by Employee"
            onChange={(e: SelectChangeEvent) => setFilterEmployee(e.target.value)}
          >
            <MenuItem value="">All Employees</MenuItem>
            {employees.map((emp) => (
              <MenuItem key={emp.id} value={emp.employee_id}>
                {emp.full_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Attendance Table */}
      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                {["Employee", "Date", "Status", "Actions"].map((col) => (
                  <TableCell
                    key={col}
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
              {tableLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Loading records...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Typography fontSize={36}>📋</Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      No attendance records found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((rec) => (
                  <TableRow
                    key={rec.id}
                    hover
                    sx={{ "&:last-child td": { border: 0 } }}
                  >
                    {/* Employee Cell */}
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
                          {rec.employee_name.charAt(0).toUpperCase()}
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {rec.employee_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {rec.employee_id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Date Cell */}
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(rec.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Typography>
                    </TableCell>

                    {/* Status Cell */}
                    <TableCell>
                      <Chip
                        label={rec.status}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: 12,
                          bgcolor: rec.status === "Present" ? "#d1fae5" : "#fee2e2",
                          color: rec.status === "Present" ? "#065f46" : "#991b1b",
                        }}
                      />
                    </TableCell>

                    {/* Actions Cell */}
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(rec.id)}
                        disabled={deletingId === rec.id}
                        sx={{
                          textTransform: "none",
                          borderRadius: 2,
                          fontSize: 12,
                          minWidth: 80,
                        }}
                      >
                        {deletingId === rec.id ? (
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
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Table Footer */}
        {filteredRecords.length > 0 && (
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
              Showing {filteredRecords.length} of {records.length} records
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}