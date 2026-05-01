from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..controllers import resources as controller
from ..schemas import resources as schema
from ..dependencies.database import get_db

# The routers for the resources table.
# Viewable by the FastAPI app reload in the terminal!

router = APIRouter(
    tags=["Resources"],
    prefix="/resources"
)


@router.get("/check-ingredients")
def check_ingredients(db: Session = Depends(get_db)):
    return controller.check_ingredients(db)


@router.post("/", response_model=schema.Resource)
def create(request: schema.ResourceCreate, db: Session = Depends(get_db)):
    return controller.create(db=db, request=request)


@router.get("/", response_model=list[schema.Resource])
def read_all(category: Optional[str] = None, db: Session = Depends(get_db)):
    return controller.read_all(db, category=category)


@router.get("/{item_id}", response_model=schema.Resource)
def read_one(item_id: int, db: Session = Depends(get_db)):
    return controller.read_one(db=db, item_id=item_id)


@router.put("/{item_id}", response_model=schema.Resource)
def update(item_id: int, request: schema.ResourceUpdate, db: Session = Depends(get_db)):
    return controller.update(db=db, item_id=item_id, request=request)


@router.delete("/{item_id}")
def delete(item_id: int, db: Session = Depends(get_db)):
    return controller.delete(db=db, item_id=item_id)
