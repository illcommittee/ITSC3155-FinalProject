from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..controllers import review as controller
from ..schemas import review as schema
from ..dependencies.database import get_db

# The routers for the reviews table.
# Viewable by the FastAPI app reload in the terminal!

router = APIRouter(
    tags=["Reviews"],
    prefix="/reviews"
)


@router.get("/top-dishes")
def top_dishes(db: Session = Depends(get_db)):
    return controller.top_dishes(db)


@router.post("/", response_model=schema.Review)
def create(request: schema.ReviewCreate, db: Session = Depends(get_db)):
    return controller.create(db=db, request=request)


@router.get("/", response_model=list[schema.Review])
def read_all(resource_id: Optional[int] = None, db: Session = Depends(get_db)):
    return controller.read_all(db, resource_id=resource_id)


@router.get("/{item_id}", response_model=schema.Review)
def read_one(item_id: int, db: Session = Depends(get_db)):
    return controller.read_one(db=db, item_id=item_id)


@router.put("/{item_id}", response_model=schema.Review)
def update(item_id: int, request: schema.ReviewUpdate, db: Session = Depends(get_db)):
    return controller.update(db=db, item_id=item_id, request=request)


@router.delete("/{item_id}")
def delete(item_id: int, db: Session = Depends(get_db)):
    return controller.delete(db=db, item_id=item_id)
