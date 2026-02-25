from fastapi import APIRouter
from app.database import employee_collection, attendance_collection
from app.utils import success_response

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/")
async def get_dashboard():

    total_employees = await employee_collection.count_documents({})
    total_attendance = await attendance_collection.count_documents({})
    total_present = await attendance_collection.count_documents({"status": "Present"})
    total_absent = await attendance_collection.count_documents({"status": "Absent"})

    # Per employee present count
    employees_summary = []
    async for emp in employee_collection.find():
        present_count = await attendance_collection.count_documents({
            "employee_id": emp["employee_id"],
            "status": "Present"
        })
        absent_count = await attendance_collection.count_documents({
            "employee_id": emp["employee_id"],
            "status": "Absent"
        })
        employees_summary.append({
            "employee_id": emp["employee_id"],
            "full_name": emp["full_name"],
            "department": emp["department"],
            "total_present": present_count,
            "total_absent": absent_count
        })

    return success_response(
        data={
            "total_employees": total_employees,
            "total_attendance_records": total_attendance,
            "total_present": total_present,
            "total_absent": total_absent,
            "employees_summary": employees_summary
        },
        message="Dashboard data fetched successfully"
    )