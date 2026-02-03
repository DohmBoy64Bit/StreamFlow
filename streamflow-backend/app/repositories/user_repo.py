import uuid

from sqlalchemy.orm import Session

from app.models.db_models import User


def create_user(db: Session, username: str, password_hash: str) -> User:
    """Create a new user."""
    user = User(username=username, password_hash=password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_username(db: Session, username: str) -> User | None:
    """Get a user by username."""
    return db.query(User).filter(User.username == username).first()


def get_user_by_id(db: Session, user_id: uuid.UUID) -> User | None:
    """Get a user by ID."""
    return db.query(User).filter(User.id == user_id).first()


def update_password(db: Session, user_id: uuid.UUID, new_password_hash: str) -> bool:
    """Update a user's password hash."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False

    user.password_hash = new_password_hash
    db.commit()
    return True
