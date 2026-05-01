from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..controllers import promotions as controller
from ..schemas import promotions as schema
from ..dependencies.database import get_db

# The routers for the Promotions table.
# Viewable by the FastAPI app reload in the terminal!

router = APIRouter(
    tags=["Promotions"],
    prefix="/promotions"
)


@router.get("/validate/{code}", response_model=schema.Promotion)
def validate(code: str, db: Session = Depends(get_db)):
    return controller.validate(db=db, code=code)


@router.post("/", response_model=schema.Promotion)
def create(request: schema.PromotionCreate, db: Session = Depends(get_db)):
    return controller.create(db=db, request=request)


@router.get("/", response_model=list[schema.Promotion])
def read_all(db: Session = Depends(get_db)):
    return controller.read_all(db)


@router.get("/{item_id}", response_model=schema.Promotion)
def read_one(item_id: int, db: Session = Depends(get_db)):
    return controller.read_one(db=db, item_id=item_id)


@router.put("/{item_id}", response_model=schema.Promotion)
def update(item_id: int, request: schema.PromotionUpdate, db: Session = Depends(get_db)):
    return controller.update(db=db, item_id=item_id, request=request)


@router.delete("/{item_id}")
def delete(item_id: int, db: Session = Depends(get_db)):
    return controller.delete(db=db, item_id=item_id)
