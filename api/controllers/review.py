from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status, Response
from sqlalchemy.exc import SQLAlchemyError
from ..models import review as model
from ..models import resources as resource_model


def create(db: Session, request):
    new_item = model.Review(
        customer_id=request.customer_id,
        resource_id=request.resource_id,
        review_txt=request.review_txt,
        score=request.score,
    )
    try:
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
    except SQLAlchemyError as e:
        error = str(e.__dict__.get("orig", e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return new_item


def read_all(db: Session, resource_id: int = None):
    try:
        q = db.query(model.Review)
        if resource_id is not None:
            q = q.filter(model.Review.resource_id == resource_id)
        return q.all()
    except SQLAlchemyError as e:
        error = str(e.__dict__.get("orig", e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    

def read_one(db: Session, item_id: int):
    try:
        item = db.query(model.Review).filter(model.Review.id == item_id).first()
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
        return item
    except SQLAlchemyError as e:
        error = str(e.__dict__.get("orig", e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    

def top_dishes(db: Session):
    """Return resources sorted by average review score (descending)."""
    try:
        results = (
            db.query(
                resource_model.Resource,
                func.avg(model.Review.score).label("avg_score"),
                func.count(model.Review.id).label("review_count"),
            )
            .outerjoin(model.Review, model.Review.resource_id == resource_model.Resource.id)
            .group_by(resource_model.Resource.id)
            .order_by(func.avg(model.Review.score).desc())
            .all()
        )
        return [
            {
                "id": r.Resource.id,
                "dishes": r.Resource.dishes,
                "menu_price": r.Resource.menu_price,
                "category": r.Resource.category,
                "avg_score": round(r.avg_score, 1) if r.avg_score else None,
                "review_count": r.review_count,
            }
            for r in results
        ]
    except SQLAlchemyError as e:
        error = str(e.__dict__.get("orig", e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    

def get_customer_review(db: Session, customer_id: int, resource_id: int):
    try:
        return db.query(model.Review).filter(
            model.Review.customer_id == customer_id,
            model.Review.resource_id == resource_id
        ).first()
    except SQLAlchemyError as e:
        error = str(e.__dict__.get("orig", e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)


def update(db: Session, item_id: int, request):
    try:
        item = db.query(model.Review).filter(model.Review.id == item_id)
        if not item.first():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
        item.update(request.model_dump(exclude_unset=True), synchronize_session=False)
        db.commit()
        return item.first()
    except SQLAlchemyError as e:
        error = str(e.__dict__.get("orig", e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    

def delete(db: Session, item_id: int):
    try:
        item = db.query(model.Review).filter(model.Review.id == item_id)
        if not item.first():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
        item.delete(synchronize_session=False)
        db.commit()
    except SQLAlchemyError as e:
        error = str(e.__dict__.get("orig", e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return Response(status_code=status.HTTP_204_NO_CONTENT)