import { useEffect, useState } from "react";
import API from "../api/api";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface EmployeeSummary {
  employee_id: string;
  full_name: string;
  department: string;
  total_present: number;
  total_absent: number;
}

interface DashboardData {
  total_employees: number;
  total_attendance_records: number;
  total_present: number;
  total_absent: number;
  employees_summary: EmployeeSummary[];
}

// ─────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────
function StatCard({
  title,
  value,
  icon,
  bgcolor,
  sub,
}: {
  title: string;
  value: number;
  icon: string;
  bgcolor: string;
  sub?: string;
}) {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ p: 3, borderRadius: 3, bgcolor, display: "flex", alignItems: "flex-start", gap: 2 }}
    >
      <Typography fontSize={36}>{icon}</Typography>
      <Box>
        <Typography
          variant="caption"
          fontWeight={600}
          color="text.secondary"
          sx={{ textTransform: "uppercase", letterSpacing: 0.8 }}
        >
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={800} color="text.primary" mt={0.5}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.secondary">
            {sub}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

// ─────────────────────────────────────────────
// Department Chip
// ─────────────────────────────────────────────
const DEPT_COLORS: Record<string, { bg: string; color: string }> = {
  Engineering: { bg: "#dbeafe", color: "#1d4ed8" },
  HR:          { bg: "#ede9fe", color: "#6d28d9" },
  Finance:     { bg: "#dcfce7", color: "#15803d" },
  Marketing:   { bg: "#ffedd5", color: "#c2410c" },
  Sales:       { bg: "#fef9c3", color: "#a16207" },
  Operations:  { bg: "#fee2e2", color: "#b91c1c" },
};

function DeptChip({ dept }: { dept: string }) {
  const style = DEPT_COLORS[dept] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <Chip
      label={dept}
      size="small"
      sx={{ bgcolor: style.bg, color: style.color, fontWeight: 600, fontSize: 11 }}
    />
  );
}

// ─────────────────────────────────────────────
// Attendance Progress Bar
// ─────────────────────────────────────────────
function AttendanceBar({ present, absent }: { present: number; absent: number }) {
  const total = present + absent;
  const pct = total === 0 ? 0 : Math.round((present / total) * 100);
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Box
        sx={{
          flex: 1,
          height: 8,
          bgcolor: "grey.100",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg, #34d399, #10b981)",
            borderRadius: 99,
            transition: "width 0.5s ease",
          }}
        />
      </Box>
      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ minWidth: 36, textAlign: "right" }}>
        {pct}%
      </Typography>
    </Box>
  );
}

// ─────────────────────────────────────────────
// Dashboard Page
// ─────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/dashboard/");
      setData(res.data.data);
    } catch {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ── Loading ──
  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={300} gap={2}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={300} gap={2}>
        <Typography fontSize={48}>⚠️</Typography>
        <Alert severity="error" sx={{ maxWidth: 400 }}>{error}</Alert>
        <Button variant="contained" onClick={fetchDashboard} sx={{ borderRadius: 2, textTransform: "none" }}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!data) return null;

  const attendanceRate =
    data.total_attendance_records === 0
      ? 0
      : Math.round((data.total_present / data.total_attendance_records) * 100);

  const filteredSummary = data.employees_summary.filter((emp) => {
    const q = search.toLowerCase();
    return (
      emp.full_name.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q) ||
      emp.employee_id.toLowerCase().includes(q)
    );
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>

      {/* ── Header ── */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="text.primary">
            📊 Dashboard
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Overview of your workforce and attendance
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={fetchDashboard}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          🔄 Refresh
        </Button>
      </Box>

      {/* ── Stat Cards ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", xl: "repeat(4, 1fr)" },
          gap: 2,
        }}
      >
        <StatCard title="Total Employees"      value={data.total_employees}           icon="👥" bgcolor="#fff"         sub="Registered in system" />
        <StatCard title="Attendance Records"   value={data.total_attendance_records}  icon="📋" bgcolor="#fff"         sub="All time entries" />
        <StatCard title="Present"              value={data.total_present}             icon="✅" bgcolor="#f0fdf4"      sub={`${attendanceRate}% attendance rate`} />
        <StatCard title="Absent"               value={data.total_absent}              icon="❌" bgcolor="#fff1f2"      sub={`${100 - attendanceRate}% absence rate`} />
      </Box>

      {/* ── Overall Attendance Rate Bar ── */}
      <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography variant="subtitle1" fontWeight={700}>
            Overall Attendance Rate
          </Typography>
          <Typography variant="h5" fontWeight={800} color="success.main">
            {attendanceRate}%
          </Typography>
        </Box>

        <Box sx={{ width: "100%", height: 16, bgcolor: "grey.100", borderRadius: 99, overflow: "hidden" }}>
          <Box
            sx={{
              height: "100%",
              width: `${attendanceRate}%`,
              background: "linear-gradient(90deg, #34d399, #059669)",
              borderRadius: 99,
              transition: "width 0.7s ease",
            }}
          />
        </Box>

        <Box display="flex" justifyContent="space-between" mt={1}>
          {["0%", "25%", "50%", "75%", "100%"].map((label) => (
            <Typography key={label} variant="caption" color="text.disabled">
              {label}
            </Typography>
          ))}
        </Box>
      </Paper>

      {/* ── Employee Summary Table ── */}
      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>

        {/* Table Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Employee Attendance Summary
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredSummary.length} of {data.employees_summary.length} employees
            </Typography>
          </Box>

          <TextField
            placeholder="Search by name, ID or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ width: { xs: "100%", sm: 280 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">🔍</InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Table Body */}
        {filteredSummary.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8} gap={1}>
            <Typography fontSize={40}>🔍</Typography>
            <Typography variant="body2" color="text.secondary">
              No employees match your search
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  {["Employee", "Department", "Present", "Absent", "Attendance Rate"].map((col) => (
                    <TableCell
                      key={col}
                      align={["Present", "Absent"].includes(col) ? "center" : "left"}
                      sx={{ fontWeight: 700, color: "text.secondary", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredSummary.map((emp) => (
                  <TableRow key={emp.employee_id} hover sx={{ "&:last-child td": { border: 0 } }}>

                    {/* Employee */}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 700,
                            fontSize: 14,
                            flexShrink: 0,
                          }}
                        >
                          {emp.full_name.charAt(0).toUpperCase()}
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{emp.full_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{emp.employee_id}</Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Department */}
                    <TableCell>
                      <DeptChip dept={emp.department} />
                    </TableCell>

                    {/* Present */}
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "#d1fae5",
                          color: "#065f46",
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {emp.total_present}
                      </Box>
                    </TableCell>

                    {/* Absent */}
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "#fee2e2",
                          color: "#991b1b",
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {emp.total_absent}
                      </Box>
                    </TableCell>

                    {/* Attendance Rate Bar */}
                    <TableCell sx={{ minWidth: 160 }}>
                      <AttendanceBar present={emp.total_present} absent={emp.total_absent} />
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Footer */}
        <Box sx={{ px: 3, py: 1.5, bgcolor: "grey.50", borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary">
            Showing {filteredSummary.length} of {data.employees_summary.length} employees
          </Typography>
        </Box>
      </Paper>

    </Box>
  );
}