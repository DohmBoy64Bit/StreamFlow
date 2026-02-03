import uuid

import pytest
from sqlalchemy.exc import IntegrityError

from app.repositories import list_repo, user_repo


@pytest.fixture
def test_user(db_session):
    """Create a test user."""
    return user_repo.create_user(db_session, "testuser", "hashed_password")


def test_create_list(db_session, test_user):
    list_obj = list_repo.create_list(db_session, test_user.id, "My Watchlist")

    assert list_obj.id is not None
    assert isinstance(list_obj.id, uuid.UUID)
    assert list_obj.user_id == test_user.id
    assert list_obj.name == "My Watchlist"
    assert list_obj.created_at is not None
    assert list_obj.updated_at is not None


def test_get_user_lists(db_session, test_user):
    list_repo.create_list(db_session, test_user.id, "Favorites")
    list_repo.create_list(db_session, test_user.id, "Watch Later")

    lists = list_repo.get_user_lists(db_session, test_user.id)

    assert len(lists) == 2
    assert lists[0].name == "Favorites"
    assert lists[1].name == "Watch Later"


def test_get_user_lists_empty(db_session, test_user):
    lists = list_repo.get_user_lists(db_session, test_user.id)

    assert len(lists) == 0


def test_get_list_by_id(db_session, test_user):
    created_list = list_repo.create_list(db_session, test_user.id, "My List")

    retrieved_list = list_repo.get_list_by_id(db_session, created_list.id, test_user.id)

    assert retrieved_list is not None
    assert retrieved_list.id == created_list.id
    assert retrieved_list.name == "My List"


def test_get_list_by_id_not_found(db_session, test_user):
    random_uuid = uuid.uuid4()
    retrieved_list = list_repo.get_list_by_id(db_session, random_uuid, test_user.id)

    assert retrieved_list is None


def test_get_list_by_id_wrong_user(db_session, test_user):
    other_user = user_repo.create_user(db_session, "otheruser", "hashed_password")
    created_list = list_repo.create_list(db_session, other_user.id, "Other User's List")

    retrieved_list = list_repo.get_list_by_id(db_session, created_list.id, test_user.id)

    assert retrieved_list is None


def test_delete_list(db_session, test_user):
    created_list = list_repo.create_list(db_session, test_user.id, "To Delete")

    result = list_repo.delete_list(db_session, created_list.id, test_user.id)
    assert result is True

    retrieved_list = list_repo.get_list_by_id(db_session, created_list.id, test_user.id)
    assert retrieved_list is None


def test_delete_list_not_found(db_session, test_user):
    random_uuid = uuid.uuid4()
    result = list_repo.delete_list(db_session, random_uuid, test_user.id)

    assert result is False


def test_add_item_to_list(db_session, test_user):
    created_list = list_repo.create_list(db_session, test_user.id, "My List")

    item = list_repo.add_item_to_list(db_session, created_list.id, 12345, "movie")

    assert item.id is not None
    assert isinstance(item.id, uuid.UUID)
    assert item.list_id == created_list.id
    assert item.tmdb_id == 12345
    assert item.media_type == "movie"
    assert item.added_at is not None


def test_add_item_to_list_duplicate(db_session, test_user):
    created_list = list_repo.create_list(db_session, test_user.id, "My List")
    list_repo.add_item_to_list(db_session, created_list.id, 12345, "movie")

    with pytest.raises(IntegrityError):
        list_repo.add_item_to_list(db_session, created_list.id, 12345, "movie")


def test_remove_item_from_list(db_session, test_user):
    created_list = list_repo.create_list(db_session, test_user.id, "My List")
    item = list_repo.add_item_to_list(db_session, created_list.id, 12345, "movie")

    result = list_repo.remove_item_from_list(db_session, created_list.id, item.id)
    assert result is True

    items = list_repo.get_list_items(db_session, created_list.id)
    assert len(items) == 0


def test_remove_item_from_list_not_found(db_session, test_user):
    created_list = list_repo.create_list(db_session, test_user.id, "My List")
    random_uuid = uuid.uuid4()

    result = list_repo.remove_item_from_list(db_session, created_list.id, random_uuid)
    assert result is False


def test_get_list_items(db_session, test_user):
    created_list = list_repo.create_list(db_session, test_user.id, "My List")
    list_repo.add_item_to_list(db_session, created_list.id, 12345, "movie")
    list_repo.add_item_to_list(db_session, created_list.id, 67890, "tv")

    items = list_repo.get_list_items(db_session, created_list.id)

    assert len(items) == 2
    assert items[0].tmdb_id == 12345
    assert items[0].media_type == "movie"
    assert items[1].tmdb_id == 67890
    assert items[1].media_type == "tv"


def test_get_list_items_empty(db_session, test_user):
    created_list = list_repo.create_list(db_session, test_user.id, "Empty List")

    items = list_repo.get_list_items(db_session, created_list.id)

    assert len(items) == 0
