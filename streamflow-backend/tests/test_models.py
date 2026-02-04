import uuid

import pytest
from sqlalchemy.exc import IntegrityError

from app.models.db_models import List, ListItem, RecoveryCode, User, WatchHistory


class TestUserModel:
    def test_create_user(self, db_session):
        """Test creating a user with all required fields."""
        user = User(
            username="testuser",
            password_hash="hashed_password",
        )
        db_session.add(user)
        db_session.commit()

        assert user.id is not None
        assert isinstance(user.id, uuid.UUID)
        assert user.username == "testuser"
        assert user.password_hash == "hashed_password"
        assert user.created_at is not None
        assert user.updated_at is not None

    def test_user_unique_username(self, db_session):
        """Test that usernames must be unique."""
        user1 = User(username="testuser", password_hash="hash1")
        user2 = User(username="testuser", password_hash="hash2")

        db_session.add(user1)
        db_session.commit()

        db_session.add(user2)
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_user_relationships(self, db_session):
        """Test user relationships with recovery codes, watch history, and lists."""
        user = User(username="testuser", password_hash="hash")
        db_session.add(user)
        db_session.commit()

        # Test recovery codes relationship
        recovery_code = RecoveryCode(user_id=user.id, code_hash="hashed_code", used=False)
        db_session.add(recovery_code)

        # Test watch history relationship
        watch_history = WatchHistory(
            user_id=user.id, tmdb_id=123, media_type="movie", last_position=0
        )
        db_session.add(watch_history)

        # Test lists relationship
        list_obj = List(user_id=user.id, name="My Favorites")
        db_session.add(list_obj)
        db_session.commit()

        # Refresh user to load relationships
        db_session.refresh(user)

        assert len(user.recovery_codes) == 1
        assert len(user.watch_history) == 1
        assert len(user.lists) == 1

        assert user.recovery_codes[0].code_hash == "hashed_code"
        assert user.watch_history[0].tmdb_id == 123
        assert user.lists[0].name == "My Favorites"


class TestRecoveryCodeModel:
    def test_create_recovery_code(self, db_session):
        """Test creating a recovery code."""
        user = User(username="testuser", password_hash="hash")
        db_session.add(user)
        db_session.commit()

        recovery_code = RecoveryCode(user_id=user.id, code_hash="hashed_code", used=False)
        db_session.add(recovery_code)
        db_session.commit()

        assert recovery_code.id is not None
        assert recovery_code.user_id == user.id
        assert recovery_code.code_hash == "hashed_code"
        assert recovery_code.used is False
        assert recovery_code.created_at is not None

    def test_recovery_code_cascade_delete(self, db_session):
        """Test that recovery codes are deleted when user is deleted."""
        user = User(username="testuser", password_hash="hash")
        db_session.add(user)
        db_session.commit()

        recovery_code = RecoveryCode(user_id=user.id, code_hash="hashed_code", used=False)
        db_session.add(recovery_code)
        db_session.commit()

        # Delete user
        db_session.delete(user)
        db_session.commit()

        # Recovery code should be gone
        assert db_session.query(RecoveryCode).filter_by(id=recovery_code.id).first() is None


class TestWatchHistoryModel:
    def test_create_watch_history_movie(self, db_session):
        """Test creating watch history for a movie."""
        user = User(username="testuser", password_hash="hash")
        db_session.add(user)
        db_session.commit()

        watch_history = WatchHistory(
            user_id=user.id,
            tmdb_id=123,
            media_type="movie",
            last_position=1200,  # 20 minutes
        )
        db_session.add(watch_history)
        db_session.commit()

        assert watch_history.id is not None
        assert watch_history.user_id == user.id
        assert watch_history.tmdb_id == 123
        assert watch_history.media_type == "movie"
        assert watch_history.season_number == 0
        assert watch_history.episode_number == 0
        assert watch_history.last_position == 1200
        assert watch_history.watched_at is not None

    def test_create_watch_history_episode(self, db_session):
        """Test creating watch history for a TV episode."""
        user = User(username="testuser", password_hash="hash")
        db_session.add(user)
        db_session.commit()

        watch_history = WatchHistory(
            user_id=user.id,
            tmdb_id=456,
            media_type="episode",
            season_number=1,
            episode_number=5,
            last_position=1800,
        )
        db_session.add(watch_history)
        db_session.commit()

        assert watch_history.media_type == "episode"
        assert watch_history.season_number == 1
        assert watch_history.episode_number == 5

    def test_watch_history_invalid_media_type(self, db_session):
        """Test that invalid media types are rejected."""
        user = User(username="testuser", password_hash="hash")
        db_session.add(user)
        db_session.commit()

        watch_history = WatchHistory(
            user_id=user.id,
            tmdb_id=123,
            media_type="invalid",  # Should be movie, tv, or episode
            last_position=0,
        )
        db_session.add(watch_history)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_watch_history_unique_constraint(self, db_session):
        """Test unique constraint on user+content combination."""
        user = User(username="testuser", password_hash="hash")
        db_session.add(user)
        db_session.commit()

        # Create first watch history entry
        wh1 = WatchHistory(user_id=user.id, tmdb_id=123, media_type="movie", last_position=1000)
        # season_number and episode_number default to 0
        db_session.add(wh1)
        db_session.commit()

        # Try to create duplicate
        wh2 = WatchHistory(user_id=user.id, tmdb_id=123, media_type="movie", last_position=2000)
        db_session.add(wh2)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_watch_history_cascade_delete(self, db_session):
        """Test that watch history is deleted when user is deleted."""
        user = User(username="testuser", password_hash="hash")
        db_session.add(user)
        db_session.commit()

        watch_history = WatchHistory(
            user_id=user.id, tmdb_id=123, media_type="movie", last_position=1000
        )
        db_session.add(watch_history)
        db_session.commit()

        # Delete user
        db_session.delete(user)
        db_session.commit()

        # Watch history should be gone
        assert db_session.query(WatchHistory).filter_by(id=watch_history.id).first() is None


class TestListModel:
    def test_create_list(self, db_session):
        """Test creating a user list."""
        user = User(username="testuser", password_hash="hash")
        db_session.add(user)
        db_session.commit()

        list_obj = List(user_id=user.id, name="My Favorites")
        db_session.add(list_obj)
        db_session.commit()

        assert list_obj.id is not None
        assert list_obj.user_id == user.id
        assert list_obj.name == "My Favorites"
        assert list_obj.created_at is not None
        assert list_obj.updated_at is not None

    def test_list_cascade_delete(self, db_session):
        """Test that lists are deleted when user is deleted."""
        user = User(username="testuser", password_hash="hash")
        db_session.add(user)
        db_session.commit()

        list_obj = List(user_id=user.id, name="Test List")
        db_session.add(list_obj)
        db_session.commit()

        # Delete user
        db_session.delete(user)
        db_session.commit()

        # List should be gone
        assert db_session.query(List).filter_by(id=list_obj.id).first() is None


class TestListItemModel:
    def test_create_list_item(self, db_session):
        """Test creating a list item."""
        user = User(username="testuser", password_hash="hash")
        db_session.add(user)
        db_session.commit()

        list_obj = List(user_id=user.id, name="My List")
        db_session.add(list_obj)
        db_session.commit()

        list_item = ListItem(list_id=list_obj.id, tmdb_id=789, media_type="movie")
        db_session.add(list_item)
        db_session.commit()

        assert list_item.id is not None
        assert list_item.list_id == list_obj.id
        assert list_item.tmdb_id == 789
        assert list_item.media_type == "movie"
        assert list_item.added_at is not None

    def test_list_item_invalid_media_type(self, db_session):
        """Test that invalid media types are rejected for list items."""
        user = User(username="testuser", password_hash="hash")
        db_session.add(user)
        db_session.commit()

        list_obj = List(user_id=user.id, name="My List")
        db_session.add(list_obj)
        db_session.commit()

        list_item = ListItem(
            list_id=list_obj.id,
            tmdb_id=789,
            media_type="episode",  # Should be movie or tv
        )
        db_session.add(list_item)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_list_item_unique_constraint(self, db_session):
        """Test unique constraint preventing duplicate items in same list."""
        user = User(username="testuser", password_hash="hash")
        db_session.add(user)
        db_session.commit()

        list_obj = List(user_id=user.id, name="My List")
        db_session.add(list_obj)
        db_session.commit()

        # Create first item
        item1 = ListItem(list_id=list_obj.id, tmdb_id=123, media_type="movie")
        db_session.add(item1)
        db_session.commit()

        # Try to create duplicate
        item2 = ListItem(list_id=list_obj.id, tmdb_id=123, media_type="movie")
        db_session.add(item2)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_list_item_cascade_delete_from_list(self, db_session):
        """Test that list items are deleted when list is deleted."""
        user = User(username="testuser", password_hash="hash")
        db_session.add(user)
        db_session.commit()

        list_obj = List(user_id=user.id, name="My List")
        db_session.add(list_obj)
        db_session.commit()

        list_item = ListItem(list_id=list_obj.id, tmdb_id=123, media_type="movie")
        db_session.add(list_item)
        db_session.commit()

        # Delete list
        db_session.delete(list_obj)
        db_session.commit()

        # List item should be gone
        assert db_session.query(ListItem).filter_by(id=list_item.id).first() is None

    def test_list_item_cascade_delete_from_user(self, db_session):
        """Test that list items are deleted when user is deleted."""
        user = User(username="testuser", password_hash="hash")
        db_session.add(user)
        db_session.commit()

        list_obj = List(user_id=user.id, name="My List")
        db_session.add(list_obj)
        db_session.commit()

        list_item = ListItem(list_id=list_obj.id, tmdb_id=123, media_type="movie")
        db_session.add(list_item)
        db_session.commit()

        # Delete user (should cascade to list and list items)
        db_session.delete(user)
        db_session.commit()

        # List item should be gone
        assert db_session.query(ListItem).filter_by(id=list_item.id).first() is None
