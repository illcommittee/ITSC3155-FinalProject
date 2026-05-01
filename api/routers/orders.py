from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.orm import Session
from ..controllers import orders as controller
from ..schemas import orders as schema
from ..dependencies.database import get_db

# The routers for the order table.
# Viewable by the FastAPI app reload in the terminal!

router = APIRouter(
    tags=["Orders"],
    prefix="/orders"
)

# The routers for the orders table.
# Viewable by the FastAPI app reload in the terminal!

@router.get("/revenue")
def revenue(target_date: Optional[date] = None, db: Session = Depends(get_db)):
    return controller.get_revenue(db, target_date)


@router.get("/track/{tracking_num}", response_model=schema.Order)
def track(tracking_num: str, db: Session = Depends(get_db)):
    return controller.read_by_tracking(db, tracking_num)


@router.post("/", response_model=schema.Order)
def create(request: schema.OrderCreate, db: Session = Depends(get_db)):
    return controller.create(db=db, request=request)


@router.get("/", response_model=list[schema.Order])
def read_all(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    from datetime import datetime
    start = datetime.combine(start_date, datetime.min.time()) if start_date else None
    end = datetime.combine(end_date, datetime.max.time()) if end_date else None
    return controller.read_all(db, start_date=start, end_date=end)


@router.get("/{item_id}", response_model=schema.Order)
def read_one(item_id: int, db: Session = Depends(get_db)):
    return controller.read_one(db, item_id=item_id)


@router.put("/{item_id}", response_model=schema.Order)
def update(item_id: int, request: schema.OrderUpdate, db: Session = Depends(get_db)):
    return controller.update(db=db, request=request, item_id=item_id)


@router.delete("/{item_id}")
def delete(item_id: int, db: Session = Depends(get_db)):
    return controller.delete(db=db, item_id=item_id)
