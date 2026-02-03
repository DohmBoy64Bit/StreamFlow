import uuid
from collections import Counter

from sqlalchemy.orm import Session

from app.integrations.tmdb_client import tmdb_client
from app.repositories import stats_repo
from app.schemas.stats import ContentStat, GenreStat, GlobalStats, UserStats, WatchTimelineItem


async def get_global_stats(db: Session) -> GlobalStats:
    most_watched_movies_raw = stats_repo.get_most_watched_movie(db, limit=10)
    most_watched_tv_raw = stats_repo.get_most_watched_tv_show(db, limit=10)
    trending_raw = stats_repo.get_trending_this_week(db, limit=10)

    most_watched_movies = []
    for item in most_watched_movies_raw:
        try:
            details = await tmdb_client.get_movie_details(item["tmdb_id"])
            most_watched_movies.append(
                ContentStat(
                    tmdb_id=item["tmdb_id"],
                    media_type="movie",
                    title=details.title,
                    poster_path=details.poster_path,
                    watch_count=item["watch_count"],
                )
            )
        except Exception:
            pass

    most_watched_tv = []
    for item in most_watched_tv_raw:
        try:
            tv_details = await tmdb_client.get_tv_details(item["tmdb_id"])
            most_watched_tv.append(
                ContentStat(
                    tmdb_id=item["tmdb_id"],
                    media_type="tv",
                    title=tv_details.name,
                    poster_path=tv_details.poster_path,
                    watch_count=item["watch_count"],
                )
            )
        except Exception:
            pass

    trending = []
    for item in trending_raw:
        try:
            if item["media_type"] == "movie":
                movie_details = await tmdb_client.get_movie_details(item["tmdb_id"])
                trending.append(
                    ContentStat(
                        tmdb_id=item["tmdb_id"],
                        media_type="movie",
                        title=movie_details.title,
                        poster_path=movie_details.poster_path,
                        watch_count=item["watch_count"],
                    )
                )
            elif item["media_type"] == "tv":
                tv_details = await tmdb_client.get_tv_details(item["tmdb_id"])
                trending.append(
                    ContentStat(
                        tmdb_id=item["tmdb_id"],
                        media_type="tv",
                        title=tv_details.name,
                        poster_path=tv_details.poster_path,
                        watch_count=item["watch_count"],
                    )
                )
        except Exception:
            pass

    return GlobalStats(
        most_watched_movies=most_watched_movies,
        most_watched_tv_shows=most_watched_tv,
        trending_this_week=trending,
    )


async def get_user_stats(db: Session, user_id: uuid.UUID) -> UserStats:
    total_watch_time = stats_repo.get_user_total_watch_time(db, user_id)
    user_top_content = stats_repo.get_user_top_genres(db, user_id, limit=100)
    most_rewatched_raw = stats_repo.get_user_most_rewatched(db, user_id, limit=10)
    timeline_raw = stats_repo.get_user_watch_timeline(db, user_id, limit=50)

    genre_counter: Counter[tuple[int, str]] = Counter()
    for item in user_top_content:
        try:
            if item["media_type"] == "movie":
                movie_details = await tmdb_client.get_movie_details(item["tmdb_id"])
                for genre in movie_details.genres:
                    genre_counter[(genre.id, genre.name)] += 1
            elif item["media_type"] == "tv":
                tv_details = await tmdb_client.get_tv_details(item["tmdb_id"])
                for genre in tv_details.genres:
                    genre_counter[(genre.id, genre.name)] += 1
        except Exception:
            pass

    top_genres = [
        GenreStat(id=genre_id, name=genre_name, count=count)
        for (genre_id, genre_name), count in genre_counter.most_common(5)
    ]

    most_rewatched = []
    for item in most_rewatched_raw:
        try:
            if item["media_type"] == "movie":
                movie_details = await tmdb_client.get_movie_details(item["tmdb_id"])
                most_rewatched.append(
                    ContentStat(
                        tmdb_id=item["tmdb_id"],
                        media_type="movie",
                        title=movie_details.title,
                        poster_path=movie_details.poster_path,
                        watch_count=item["watch_count"],
                    )
                )
            elif item["media_type"] == "tv":
                tv_details = await tmdb_client.get_tv_details(item["tmdb_id"])
                most_rewatched.append(
                    ContentStat(
                        tmdb_id=item["tmdb_id"],
                        media_type="tv",
                        title=tv_details.name,
                        poster_path=tv_details.poster_path,
                        watch_count=item["watch_count"],
                    )
                )
        except Exception:
            pass

    timeline = []
    for entry in timeline_raw:
        try:
            if entry.media_type == "movie":
                movie_details = await tmdb_client.get_movie_details(entry.tmdb_id)
                timeline.append(
                    WatchTimelineItem(
                        tmdb_id=entry.tmdb_id,
                        media_type="movie",
                        title=movie_details.title,
                        poster_path=movie_details.poster_path,
                        season_number=None,
                        episode_number=None,
                        last_position=entry.last_position,
                        watched_at=entry.watched_at,
                    )
                )
            elif entry.media_type == "tv":
                tv_details = await tmdb_client.get_tv_details(entry.tmdb_id)
                timeline.append(
                    WatchTimelineItem(
                        tmdb_id=entry.tmdb_id,
                        media_type="tv",
                        title=tv_details.name,
                        poster_path=tv_details.poster_path,
                        season_number=entry.season_number if entry.season_number > 0 else None,
                        episode_number=entry.episode_number if entry.episode_number > 0 else None,
                        last_position=entry.last_position,
                        watched_at=entry.watched_at,
                    )
                )
        except Exception:
            pass

    return UserStats(
        total_watch_time_seconds=total_watch_time,
        top_genres=top_genres,
        most_rewatched=most_rewatched,
        watch_timeline=timeline,
    )
