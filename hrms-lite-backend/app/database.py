# database.py - Fix this immediately
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")  # ← read from environment
DB_NAME = os.getenv("DB_NAME", "hrms_db")

if not MONGO_URL:
    raise RuntimeError("MONGO_URL environment variable is not set")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

employee_collection = db["employees"]
attendance_collection = db["attendance"]