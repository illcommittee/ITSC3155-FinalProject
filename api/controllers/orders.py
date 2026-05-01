import random
import string
from datetime import datetime, date
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Response
from ..models import orders as model
from sqlalchemy.exc import SQLAlchemyError


def _gen_tracking():
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"TRK-{suffix}"


def _next_order_num(db: Session) -> int:
    last = db.query(model.Order).order_by(model.Order.order_num.desc()).first()
    return (last.order_num + 1) if last and last.order_num else 1001


def create(db: Session, request):
    new_item = model.Order(
        order_num=request.order_num,
        customer_name=request.customer_name,
        customer_id=request.customer_id,
        order_date=datetime.now(),
        tracking_num=request._gen_tracking(),
        order_status=request.order_status,
        order_type=request.order_type,
        dish_names=request.dish_names,
        total_price=request.total_price,
    )
    try:
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
    except SQLAlchemyError as e:
        error = str(e.__dict__['orig'])
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return new_item


def read_all(db: Session, start_date: datetime = None, end_date: datetime = None):
    try:
        q = db.query(model.Order)
        if start_date:
            q = q.filter(model.Order.order_date >= start_date)
        if end_date:
            q = q.filter(model.Order.order_date <= end_date)
        return q.order_by(model.Order.order_date.desc()).all()
    except SQLAlchemyError as e:
        error = str(e.__dict__['orig'])
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)


def read_one(db: Session, item_id):
    try:
        item = db.query(model.Order).filter(model.Order.id == item_id).first()
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Id not found!")
    except SQLAlchemyError as e:
        error = str(e.__dict__['orig'])
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return item


def read_by_tracking(db: Session, tracking_num: str):
    item = db.query(model.Order).filter(model.Order.tracking_num == tracking_num).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracking number not found")
    return item


def get_revenue(db: Session, target_date: date = None):
    try:
        q = db.query(model.Order)
        if target_date:
            start = datetime.combine(target_date, datetime.min.time())
            end = datetime.combine(target_date, datetime.max.time())
            q = q.filter(model.Order.order_date >= start, model.Order.order_date <= end)
        orders = q.all()
        total = sum(o.total_price for o in orders)
        return {"date": str(target_date) if target_date else "all", "revenue": round(total,2), "order_count": len(orders)}
    except SQLAlchemyError as e:
        error = str(e.__dict__["orig"])
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)


def update(db: Session, item_id, request):
    try:
        item = db.query(model.Order).filter(model.Order.id == item_id)
        if not item.first():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Id not found!")
        item.update(request.dict(exclude_unset=True), synchronize_session=False)
        db.commit()
    except SQLAlchemyError as e:
        error = str(e.__dict__["orig"])
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return item.first()


def delete(db: Session, item_id):
    try:
        item = db.query(model.Order).filter(model.Order.id == item_id)
        if not item.first():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Id not found!")
        item.delete(synchronize_session=False)
        db.commit()
    except SQLAlchemyError as e:
        error = str(e.__dict__["orig"])
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
