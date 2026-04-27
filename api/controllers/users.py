from sqlalchemy.orm import Session
from api.models.users import User
from api.schemas.users import UserCreate, UserLogin


def create_user(db: Session, user: UserCreate):
    db_user = User(
        username=user.username,
        password=user.password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def login_user(db: Session, user: UserLogin):
    db_user = get_user_by_username(db, user.username)

    if db_user is None:
        return None

    if db_user.password != user.password:
        return None

    return db_user