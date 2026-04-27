from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.dependencies.database import get_db
from api.schemas.users import UserCreate, UserLogin, User
from api.controllers import users as user_controller

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post("/", response_model=User)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = user_controller.get_user_by_username(db, user.username)

    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    return user_controller.create_user(db, user)


@router.post("/login", response_model=User)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = user_controller.login_user(db, user)

    if db_user is None:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return db_user