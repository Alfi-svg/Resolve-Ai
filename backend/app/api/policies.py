from typing import List
from fastapi import APIRouter, Query
from ..data.policies_data import POLICIES_DATABASE, search_policy

router = APIRouter(prefix="/api/policies", tags=["Policies"])

@router.get("", response_model=List[dict])
async def list_policies():
    return POLICIES_DATABASE

@router.get("/search")
async def search_policies(query: str = Query(...), category: str = None):
    return search_policy(query, category)
