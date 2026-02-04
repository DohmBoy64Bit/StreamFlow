import uuid

from sqlalchemy.orm import Session

from app.models.db_models import List, ListItem


def create_list(db: Session, user_id: uuid.UUID, name: str) -> List:
    list_obj = List(user_id=user_id, name=name)
    db.add(list_obj)
    db.commit()
    db.refresh(list_obj)
    return list_obj


def get_user_lists(db: Session, user_id: uuid.UUID) -> list[List]:
    return db.query(List).filter(List.user_id == user_id).all()


def get_list_by_id(db: Session, list_id: uuid.UUID, user_id: uuid.UUID) -> List | None:
    return db.query(List).filter(List.id == list_id, List.user_id == user_id).first()


def delete_list(db: Session, list_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    list_obj = get_list_by_id(db, list_id, user_id)
    if list_obj:
        db.delete(list_obj)
        db.commit()
        return True
    return False


def add_item_to_list(db: Session, list_id: uuid.UUID, tmdb_id: int, media_type: str) -> ListItem:
    item = ListItem(list_id=list_id, tmdb_id=tmdb_id, media_type=media_type)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def remove_item_from_list(db: Session, list_id: uuid.UUID, item_id: uuid.UUID) -> bool:
    item = db.query(ListItem).filter(ListItem.id == item_id, ListItem.list_id == list_id).first()
    if item:
        db.delete(item)
        db.commit()
        return True
    return False


def get_list_items(db: Session, list_id: uuid.UUID) -> list[ListItem]:
    return db.query(ListItem).filter(ListItem.list_id == list_id).all()


def update_list_icon(db: Session, list_id: uuid.UUID, user_id: uuid.UUID, icon_url: str) -> List | None:
    list_obj = get_list_by_id(db, list_id, user_id)
    if list_obj:
        list_obj.icon_url = icon_url
        db.commit()
        db.refresh(list_obj)
        return list_obj
    return None
