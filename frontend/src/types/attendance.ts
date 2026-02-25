export interface Attendance {
  id: number;
  employee: string; // employee_id
  date: string;
  status: "Present" | "Absent";
}