from bson import ObjectId
from datetime import datetime

def serialize_doc(doc):
    doc = dict(doc)
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.date().isoformat()
    return doc