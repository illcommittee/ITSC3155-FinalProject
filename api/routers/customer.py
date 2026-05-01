from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.orm import Session
from ..controllers import customer as controller
from ..schemas import customer as schema
from ..dependencies.database import get_db

# The routers for the customer table.
# Viewable by the FastAPI app reload in the terminal!

router = APIRouter(
    tags=["Customers"],
    prefix="/customer"
)


@router.post("/login", response_model=schema.Customer)
def login(request: schema.CustomerLogin, db: Session = Depends(get_db)):
    return controller.login(db=db, email=request.email, password=request.password)


@router.post("/", response_model=schema.Customer)
def create(request: schema.CustomerCreate, db: Session = Depends(get_db)):
    return controller.create(db=db, request=request)


@router.get("/", response_model=list[schema.Customer])
def read_all(db: Session = Depends(get_db)):
    return controller.read_all(db)


@router.get("/{item_id}", response_model=schema.Customer)
def read_one(item_id: int, db: Session = Depends(get_db)):
    return controller.read_one(db, item_id=item_id)


@router.put("/{item_id}", response_model=schema.Customer)
def update(item_id: int, request: schema.CustomerUpdate, db: Session = Depends(get_db)):
    return controller.update(db=db, request=request, item_id=item_id)


@router.delete("/{item_id}")
def delete(item_id: int, db: Session = Depends(get_db)):
    return controller.delete(db=db, item_id=item_id)
