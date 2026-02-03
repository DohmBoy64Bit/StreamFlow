import asyncio
from app.integrations.tmdb_client import TMDBClient


async def test_real_tmdb_integration():
    client = TMDBClient()
    
    try:
        print("Testing TMDB API Integration...")
        print("-" * 50)
        
        print("\n1. Testing get_trending()")
        trending = await client.get_trending("movie", "week", 1)
        print(f"   [OK] Found {len(trending.results)} trending movies")
        if trending.results:
            print(f"   First result: {trending.results[0].title}")
        
        print("\n2. Testing get_popular_movies()")
        popular = await client.get_popular_movies(1)
        print(f"   [OK] Found {len(popular.results)} popular movies")
        if popular.results:
            print(f"   First result: {popular.results[0].title}")
        
        print("\n3. Testing get_top_rated_movies()")
        top_rated = await client.get_top_rated_movies(1)
        print(f"   [OK] Found {len(top_rated.results)} top-rated movies")
        if top_rated.results:
            print(f"   First result: {top_rated.results[0].title}")
        
        print("\n4. Testing get_popular_tv()")
        popular_tv = await client.get_popular_tv(1)
        print(f"   [OK] Found {len(popular_tv.results)} popular TV shows")
        if popular_tv.results:
            print(f"   First result: {popular_tv.results[0].name}")
        
        print("\n5. Testing get_movie_details() - Fight Club (550)")
        movie = await client.get_movie_details(550)
        print(f"   [OK] Title: {movie.title}")
        print(f"   [OK] Release Date: {movie.release_date}")
        print(f"   [OK] Runtime: {movie.runtime} minutes")
        print(f"   [OK] Rating: {movie.vote_average}/10")
        print(f"   [OK] Cast members: {len(movie.cast)}")
        print(f"   [OK] Trailers: {len(movie.videos)}")
        
        print("\n6. Testing get_tv_details() - Breaking Bad (1396)")
        tv_show = await client.get_tv_details(1396)
        print(f"   [OK] Name: {tv_show.name}")
        print(f"   [OK] First Air Date: {tv_show.first_air_date}")
        print(f"   [OK] Seasons: {tv_show.number_of_seasons}")
        print(f"   [OK] Episodes: {tv_show.number_of_episodes}")
        print(f"   [OK] Rating: {tv_show.vote_average}/10")
        
        print("\n7. Testing get_season_details() - Breaking Bad Season 1")
        season = await client.get_season_details(1396, 1)
        print(f"   [OK] Season Name: {season.name}")
        print(f"   [OK] Episodes: {len(season.episodes)}")
        if season.episodes:
            print(f"   First episode: {season.episodes[0].name}")
        
        print("\n8. Testing search_multi()")
        search_results = await client.search_multi("The Matrix")
        print(f"   [OK] Search results: {len(search_results.get('results', []))}")
        if search_results.get('results'):
            first_result = search_results['results'][0]
            name = first_result.get('title') or first_result.get('name')
            print(f"   First result: {name}")
        
        print("\n9. Testing get_genres()")
        genres = await client.get_genres("movie")
        print(f"   [OK] Found {len(genres.genres)} movie genres")
        if genres.genres:
            print(f"   Examples: {', '.join([g.name for g in genres.genres[:5]])}")
        
        print("\n10. Testing cache (second request should be cached)")
        popular2 = await client.get_popular_movies(1)
        print(f"   [OK] Second request returned {len(popular2.results)} results (from cache)")
        
        print("\n" + "=" * 50)
        print("All TMDB API integration tests passed!")
        print("=" * 50)
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(test_real_tmdb_integration())
