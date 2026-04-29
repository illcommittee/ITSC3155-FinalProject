from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Response
from ..models import customer as model
from sqlalchemy.exc import SQLAlchemyError
import hashlib


def create(db: Session, request):
    new_item = model.Customer(
        order_num=request.order_num,
        customer_name=request.customer_name,
        email=request.email,
        phone_num=request.phone_num,
        address=request.address,
        password_hash=hash_password(request.password)
    )

    try:
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
    except SQLAlchemyError as e:
        error = str(e.__dict__.get("orig", e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return new_item


def read_all(db: Session):
    try:
        return db.query(model.Customer).all()
    except SQLAlchemyError as e:
        error = str(e.__dict__.get("orig", e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)


def read_one(db: Session, item_id):
    try:
        item = db.query(model.Customer).filter(model.Customer.id == item_id).first()
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Id not found!")
        return item
    except SQLAlchemyError as e:
        error = str(e.__dict__.get("orig", e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)


def update(db: Session, item_id, request):
    try:
        item = db.query(model.Customer).filter(model.Customer.id == item_id)
        if not item.first():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Id not found!")
        update_data = request.dict(exclude_unset=True)
        item.update(update_data, synchronize_session=False)
        db.commit()
        return item.first()
    except SQLAlchemyError as e:
        error = str(e.__dict__.get("orig", e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)


def delete(db: Session, item):
    try:
        item.delete(synchronize_session=False)
        db.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except SQLAlchemyError as e:
        error = str(e.__dict__.get("orig", e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

def login(db: Session, email: str, password: str):
    try:
        customer = db.query(model.Customer).filter(model.Customer.email == email).first()
        if not customer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")
        
        if customer.password_hash != hash_password(password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password.")

        return customer
    
    except SQLAlchemyError as e:
        error = str(e.__dict__.get("orig", e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()