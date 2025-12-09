import React, { useEffect, useRef, useState } from "react";
import Search from "../components/Search"; 
import Spinner from "../components/Spinner";
import MovieCard from "../components/MovieCard";

import { getTrendingMovies, updateSearchCount } from "../appwrite"; 

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY; 

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [trendingMovies, setTrendingMovies] = useState([]);

  const resultsRef = useRef(null);

  const handleSearchSubmit = (term) => {
    setSearchQuery(term);

    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const fetchResults = async (query = "") => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      
      let results = [];

      if (query) {
        const endpoint = `${API_BASE_URL}/search/multi?query=${encodeURIComponent(query)}`;
        const response = await fetch(endpoint, API_OPTIONS);

        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }

        const data = await response.json();
        
        results = (data.results || []).filter(
            (item) => item.media_type !== "person"
        );

        if (query && results.length > 0) {
          await updateSearchCount(query, results[0]);
        }

      } else {
        const moviePromise = fetch(
          `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`,
          API_OPTIONS
        ).then((res) => {
          if (!res.ok) throw new Error("Failed to fetch movies");
          return res.json();
        });

        const tvPromise = fetch(
          `${API_BASE_URL}/discover/tv?sort_by=popularity.desc`,
          API_OPTIONS
        ).then((res) => {
          if (!res.ok) throw new Error("Failed to fetch TV shows");
          return res.json();
        });

        const [movieData, tvData] = await Promise.all([moviePromise, tvPromise]);

        const allResults = [
          ...(movieData.results || []),
          ...(tvData.results || []),
        ];

        results = allResults.sort(
          (a, b) => (b.popularity || 0) - (a.popularity || 0)
        );
      }

      setMovieList(results);

    } catch (error) {
      console.error(`Error fetching results: ${error}`);
      setErrorMessage("Error fetching results. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies ${error}`);
    }
  };

  useEffect(() => {
    fetchResults(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
          <header>
            <img
              src="./logo.png"
              alt="Logo"
              className="w-24 h-24 sm:w-full sm:h-[80px] object-contain mx-auto "
            />
            <img src="./hero.png" alt="Hero Banner" className="w-full max-w-lg h-auto object-contain mx-auto drop-shadow-md" />
            <h1>
              Find <span className="text-gradient">Movies & TV</span> You'll Enjoy
              Without the Hassle
            </h1>
            
            <Search
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearchSubmit={handleSearchSubmit}
            />
          </header>

          {trendingMovies.length > 0 && (
            <section className="trending">
              <h2>Trending Movies & Shows</h2>
              
              <ul className="flex flex-row overflow-x-auto gap-5 w-full hide-scrollbar">
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id} className="min-w-[180px] sm:min-w-[230px] flex flex-row items-center">
                    <p>{index + 1}</p>
                    <img 
                      src={movie.poster_url !== "https://image.tmdb.org/t/p/w500/null" ? movie.poster_url : '/no-movie.png'} 
                      alt={movie.title}
                      className="w-[100px] h-[130px] sm:w-[127px] sm:h-[163px] rounded-lg object-cover -ml-3.5"
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="all-movies" ref={resultsRef}>
            <h2>{searchQuery ? `Results for "${searchQuery}"` : "All Movies & TV Shows"}</h2>
            {isLoading ? (
              <Spinner />
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <ul>
                {movieList.map((movie) => (
                  <div key={movie.id} className="text-white">
                    <MovieCard movie={movie} /> 
                  </div>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default HomePage;