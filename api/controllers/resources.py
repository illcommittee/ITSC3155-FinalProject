from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Response
from sqlalchemy.exc import SQLAlchemyError
from ..models import resources as model


def create(db: Session, request):
    new_item = model.Resource(
        dishes=request.dishes,
        ingredients=request.ingredients,
        resource_amount=request.resource_amount,
        menu_price=request.menu_price,
        calories=request.calories,
        allergens=request.allergens
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
        return db.query(model.Resource).all()
    except SQLAlchemyError as e:
        error = str(e.__dict__.get("orig", e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    
def read_one(db: Session, item_id: int):
    try:
        item = db.query(model.Resource).filter(model.Resource.id == item_id).first()
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
        return item
    except SQLAlchemyError as e:
        error = str(e.__dict__.get("orig", e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    
def update(db: Session, item_id, request):
    try:
        item = db.query(model.Resource).filter(model.Resource.id == item_id)
        if not item.first():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
        
        update_data = request.model_dump(exclude_unset=True)
        item.update(update_data, synchronize_session=False)
        db.commit()
        return item.first()
    except SQLAlchemyError as e:
        error = str(e.__dict__.get("orig", e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    
def delete(db: Session, item_id):
    try:
        item = db.query(model.Resource).filter(model.Resource.id == item_id)
        if not item.first():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
        
        item.delete(synchronize_session=False)
        db.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except SQLAlchemyError as e:
        error = str(e.__dict__.get("orig", e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)