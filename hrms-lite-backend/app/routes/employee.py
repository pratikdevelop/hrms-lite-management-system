from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from app.database import employee_collection, attendance_collection
from app.schemas import EmployeeCreate
from app.utils.serialize import serialize_doc
from app.utils.response import success_response, error_response

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate):

    existing_id = await employee_collection.find_one({"employee_id": employee.employee_id})
    if existing_id:
        return JSONResponse(
            status_code=400,
            content=error_response("Employee ID already exists", 400)
        )

    existing_email = await employee_collection.find_one({"email": employee.email})
    if existing_email:
        return JSONResponse(
            status_code=400,
            content=error_response("Email already registered", 400)
        )

    result = await employee_collection.insert_one(employee.dict())
    new_employee = await employee_collection.find_one({"_id": result.inserted_id})

    return JSONResponse(
        status_code=201,
        content=success_response(
            data=serialize_doc(new_employee),
            message="Employee created successfully",
            status_code=201
        )
    )


@router.get("/")
async def get_employees():
    employees = []
    async for emp in employee_collection.find():
        employees.append(serialize_doc(emp))

    return success_response(
        data=employees,
        message="Employees fetched successfully"
    )


@router.delete("/{employee_id}")
async def delete_employee(employee_id: str):
    result = await employee_collection.delete_one({"employee_id": employee_id})

    if result.deleted_count == 0:
        return JSONResponse(
            status_code=404,
            content=error_response("Employee not found", 404)
        )

    await attendance_collection.delete_many({"employee_id": employee_id})

    return success_response(message="Employee deleted successfully", data=None)