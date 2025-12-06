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

  const fetchMovies = async (query = "") => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(data.Error || "Failed to fetch movies");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies. Please try again later.");
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
    fetchMovies(searchQuery);
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
              className="w-16 h-16 sm:w-[70px] sm:h-[70px] object-contain mx-auto "
            />
            <img src="./hero.png" alt="Hero Banner" className="w-full max-w-lg h-auto object-contain mx-auto drop-shadow-md mt-4" />
            <h1>
              Find <span className="text-gradient">Movies</span> You'll Enjoy
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
              <h2>Trending Movies</h2>
              
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
            <h2>{searchQuery ? `Results for "${searchQuery}"` : "All Movies"}</h2>
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