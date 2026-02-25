from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Literal, Optional

class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

class EmployeeResponse(EmployeeCreate):
    id: str

class AttendanceCreate(BaseModel):
    employee_id: str
    date: date
    status: Literal["Present", "Absent"]  # ← enforced at schema level

class AttendanceResponse(AttendanceCreate):
    id: str