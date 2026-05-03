from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, date
from ..controllers import orders as controller
from ..schemas import orders as schema
from ..dependencies.database import get_db


router = APIRouter(
    tags=["Orders"],
    prefix="/orders"
)


@router.post("/", response_model=schema.Order)
def create(request: schema.OrderCreate, db: Session = Depends(get_db)):
    return controller.create(db=db, request=request)


@router.get("/", response_model=list[schema.Order])
def read_all(
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    db: Session = Depends(get_db)
):
    return controller.read_all(db=db, start_date=start_date, end_date=end_date)


@router.get("/tracking/{tracking_num}", response_model=schema.Order)
def read_by_tracking(tracking_num: str, db: Session = Depends(get_db)):
    return controller.read_by_tracking(db=db, tracking_num=tracking_num)


@router.get("/customer/{customer_id}", response_model=list[schema.Order])
def read_by_customer(customer_id: int, db: Session = Depends(get_db)):
    return controller.read_by_customer(db=db, customer_id=customer_id)


@router.get("/revenue/")
def get_revenue(target_date: date | None = None, db: Session = Depends(get_db)):
    return controller.get_revenue(db=db, target_date=target_date)


@router.get("/{item_id}", response_model=schema.Order)
def read_one(item_id: int, db: Session = Depends(get_db)):
    return controller.read_one(db, item_id=item_id)


@router.put("/{item_id}", response_model=schema.Order)
def update(item_id: int, request: schema.OrderUpdate, db: Session = Depends(get_db)):
    return controller.update(db=db, request=request, item_id=item_id)


@router.delete("/{item_id}")
def delete(item_id: int, db: Session = Depends(get_db)):
    return controller.delete(db=db, item_id=item_id)