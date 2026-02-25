from fastapi import APIRouter
from fastapi.responses import JSONResponse
from datetime import datetime, date
from typing import Optional
from app.database import attendance_collection, employee_collection
from app.schemas import AttendanceCreate
from app.utils.serialize import serialize_doc
from app.utils.response import success_response, error_response
from bson import ObjectId
from bson.errors import InvalidId

router = APIRouter(prefix="/attendance", tags=["Attendance"])


# ── GET ALL ATTENDANCE (with optional date filter) ──
@router.get("/")
async def get_all_attendance(filter_date: Optional[str] = None):
    query = {}

    if filter_date:
        try:
            parsed = datetime.strptime(filter_date, "%Y-%m-%d")
            # Match from start to end of that day
            query["date"] = {
                "$gte": datetime(parsed.year, parsed.month, parsed.day, 0, 0, 0),
                "$lt":  datetime(parsed.year, parsed.month, parsed.day, 23, 59, 59),
            }
        except ValueError:
            return JSONResponse(
                status_code=400,
                content=error_response("Invalid date format. Use YYYY-MM-DD", 400)
            )

    records = []
    async for rec in attendance_collection.find(query).sort("date", -1):
        attendance = serialize_doc(rec)
        employee = await employee_collection.find_one(
            {"employee_id": attendance["employee_id"]}
        )
        attendance["employee_name"] = employee["full_name"] if employee else "Unknown"
        records.append(attendance)

    return success_response(data=records, message="Attendance records fetched successfully")


# ── MARK ATTENDANCE ──
@router.post("/")
async def mark_attendance(data: AttendanceCreate):

    # Check employee exists
    employee = await employee_collection.find_one({"employee_id": data.employee_id})
    if not employee:
        return JSONResponse(
            status_code=404,
            content=error_response("Employee not found", 404)
        )

    # ✅ Normalize: strip time, keep only the date part
    # Store as: year, month, day at 00:00:00 — always consistent
    attendance_date = datetime(data.date.year, data.date.month, data.date.day, 0, 0, 0)

    # ✅ Duplicate check: same employee + same date (range check to be safe)
    existing = await attendance_collection.find_one({
        "employee_id": data.employee_id,
        "date": {
            "$gte": datetime(data.date.year, data.date.month, data.date.day, 0, 0, 0),
            "$lt":  datetime(data.date.year, data.date.month, data.date.day, 23, 59, 59),
        }
    })

    if existing:
        return JSONResponse(
            status_code=400,
            content=error_response(
                f"Attendance for {employee['full_name']} on {data.date} is already marked as '{existing['status']}'",
                400
            )
        )

    # Insert
    attendance_data = {
        "employee_id": data.employee_id,
        "date": attendance_date,
        "status": data.status,
    }

    result = await attendance_collection.insert_one(attendance_data)
    new_record = await attendance_collection.find_one({"_id": result.inserted_id})

    response = serialize_doc(new_record)
    response["employee_name"] = employee["full_name"]

    return JSONResponse(
        status_code=201,
        content=success_response(
            data=response,
            message="Attendance marked successfully",
            status_code=201
        )
    )


# ── GET ATTENDANCE BY EMPLOYEE ──
@router.get("/{employee_id}")
async def get_attendance_by_employee(employee_id: str):

    employee = await employee_collection.find_one({"employee_id": employee_id})
    if not employee:
        return JSONResponse(
            status_code=404,
            content=error_response("Employee not found", 404)
        )

    records = []
    async for rec in attendance_collection.find({"employee_id": employee_id}).sort("date", -1):
        attendance = serialize_doc(rec)
        attendance["employee_name"] = employee["full_name"]
        records.append(attendance)

    total_present = sum(1 for r in records if r["status"] == "Present")
    total_absent  = sum(1 for r in records if r["status"] == "Absent")

    return success_response(
        data={
            "employee": {
                "employee_id": employee["employee_id"],
                "full_name":   employee["full_name"],
                "department":  employee["department"],
            },
            "total_present":  total_present,
            "total_absent":   total_absent,
            "total_records":  len(records),
            "records":        records,
        },
        message=f"Attendance for {employee['full_name']} fetched successfully"
    )


# ── DELETE ATTENDANCE ──
@router.delete("/{attendance_id}")
async def delete_attendance(attendance_id: str):
    try:
        obj_id = ObjectId(attendance_id)
    except InvalidId:
        return JSONResponse(
            status_code=400,
            content=error_response("Invalid attendance ID format", 400)
        )

    result = await attendance_collection.delete_one({"_id": obj_id})

    if result.deleted_count == 0:
        return JSONResponse(
            status_code=404,
            content=error_response("Attendance record not found", 404)
        )

    return success_response(message="Attendance deleted successfully", data=None)