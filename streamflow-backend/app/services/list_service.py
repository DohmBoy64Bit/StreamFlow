import uuid

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.db_models import List, ListItem
from app.repositories import list_repo


class ListNotFoundError(Exception):
    """Raised when a list is not found or user doesn't have access."""

    pass


class ItemAlreadyInListError(Exception):
    """Raised when attempting to add an item that's already in the list."""

    pass


class ItemNotFoundError(Exception):
    """Raised when attempting to remove an item that doesn't exist."""

    pass


def create_list(db: Session, user_id: uuid.UUID, name: str) -> List:
    return list_repo.create_list(db, user_id, name)


def get_user_lists(db: Session, user_id: uuid.UUID) -> list[List]:
    return list_repo.get_user_lists(db, user_id)


def get_list_by_id(db: Session, list_id: uuid.UUID, user_id: uuid.UUID) -> List:
    list_obj = list_repo.get_list_by_id(db, list_id, user_id)
    if not list_obj:
        raise ListNotFoundError(f"List with id {list_id} not found or access denied")
    return list_obj


def delete_list(db: Session, list_id: uuid.UUID, user_id: uuid.UUID) -> None:
    deleted = list_repo.delete_list(db, list_id, user_id)
    if not deleted:
        raise ListNotFoundError(f"List with id {list_id} not found or access denied")


def add_item_to_list(
    db: Session, list_id: uuid.UUID, user_id: uuid.UUID, tmdb_id: int, media_type: str
) -> ListItem:
    list_obj = get_list_by_id(db, list_id, user_id)

    try:
        return list_repo.add_item_to_list(db, list_obj.id, tmdb_id, media_type)
    except IntegrityError:
        db.rollback()
        raise ItemAlreadyInListError(f"Item {tmdb_id} ({media_type}) is already in this list")


def remove_item_from_list(
    db: Session, list_id: uuid.UUID, item_id: uuid.UUID, user_id: uuid.UUID
) -> None:
    get_list_by_id(db, list_id, user_id)

    deleted = list_repo.remove_item_from_list(db, list_id, item_id)
    if not deleted:
        raise ItemNotFoundError(f"Item with id {item_id} not found in this list")


def get_list_items(db: Session, list_id: uuid.UUID, user_id: uuid.UUID) -> list[ListItem]:
    get_list_by_id(db, list_id, user_id)
    return list_repo.get_list_items(db, list_id)


def update_list_icon(db: Session, list_id: uuid.UUID, user_id: uuid.UUID, icon_url: str) -> List:
    list_obj = list_repo.update_list_icon(db, list_id, user_id, icon_url)
    if not list_obj:
        raise ListNotFoundError(f"List with id {list_id} not found or access denied")
    return list_obj
