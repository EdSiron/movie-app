import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import MovieCard from "../components/MovieCard";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const fetchData = async (endpoint) => {
  const response = await fetch(endpoint, API_OPTIONS);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
};

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detailedMovie, setDetailedMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [homepage, setHomepage] = useState("");
  const [trailerKey, setTrailerKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAllDetails = async (movieId) => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const movieDetailsPromise = fetchData(`${API_BASE_URL}/movie/${movieId}`);
      const similarMoviesPromise = fetchData(
        `${API_BASE_URL}/movie/${movieId}/similar`
      );
      const creditsPromise = fetchData(
        `${API_BASE_URL}/movie/${movieId}/credits`
      );
      const videosPromise = fetchData(
        `${API_BASE_URL}/movie/${movieId}/videos`
      );

      const [details, similar, credits, videos] = await Promise.all([
        movieDetailsPromise,
        similarMoviesPromise,
        creditsPromise,
        videosPromise,
      ]);

      const director = credits.crew.find((crew) => crew.job === "Director");

      const trailer = videos.results.find(
        (video) => video.type === "Trailer" && video.site === "YouTube"
      );

      setDetailedMovie({ ...details, director: director?.name || "N/A" });
      setHomepage(details.homepage);
      setSimilarMovies(similar.results.slice(0, 6) || []);
      setTrailerKey(trailer?.key || null);
    } catch (error) {
      console.error(`Error fetching movie details: ${error}`);
      setErrorMessage("Error fetching movie details. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const goToHomepage = () => {
    window.open(homepage, "_blank");
  };

  useEffect(() => {
    if (id) {
      window.scrollTo(0, 0);
      fetchAllDetails(id);
    }
  }, [id]);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
        <Spinner />
      </div>
    );
  if (errorMessage) return <p className="text-red-500 p-8">{errorMessage}</p>;
  if (!detailedMovie) return null;

  const backgroundImageUrl = detailedMovie?.backdrop_path
    ? `https://image.tmdb.org/t/p/original/${detailedMovie.backdrop_path}`
    : "";

  const posterImageUrl = detailedMovie?.poster_path
    ? `https://image.tmdb.org/t/p/w500/${detailedMovie.poster_path}`
    : "/movie-app/no-movie.png";

  const genres = detailedMovie.genres.map((g) => (
    <span key={g.id} className="border-2 mr-2 px-2 py-1 rounded">
      {g.name}
    </span>
  ));
  const runtime = detailedMovie.runtime
    ? `${detailedMovie.runtime} min`
    : "N/A";
  const rating = detailedMovie.vote_average
    ? detailedMovie.vote_average.toFixed(1)
    : "N/A";

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <section
        className="relative h-[100vh] flex items-end pb-20 overflow-hidden"
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "top center",
        }}
      >
        <button
          onClick={() => navigate("/")}
          className="absolute top-1 m-8 mb-4 bg-red-600 hover:bg-red-700 cursor-pointer text-white font-bold px-4 py-2 rounded z-20"
        >
          ← Back
        </button>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-[#0d0d0d] opacity-90 z-10"></div>
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>

        <div className="relative z-20 max-w-7xl mx-auto w-full flex items-center p-8 md:p-16">
          <div className="hidden md:block w-1/3 max-w-xs mr-10 h-100">
            <img
              src={posterImageUrl}
              alt={detailedMovie.title}
              className="rounded-lg shadow-2xl"
            />
          </div>

          <div className="w-full text-white">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-2 leading-tight">
              {detailedMovie.title}
            </h2>

            <div className="flex items-center space-x-4 mb-4">
              <span className="text-xl font-bold">⭐ {rating}</span>
              <span className="text-lg text-gray-400">|</span>
              <span className="text-xl font-light">{genres}</span>
            </div>

            <p className="text-gray-300 max-w-2xl mb-6 text-base line-clamp-3 md:line-clamp-none">
              {detailedMovie.overview}
            </p>

            <div className="space-y-2 mb-8 text-lg">
              <p>
                <strong>Runtime:</strong> {runtime}
              </p>
              <p>
                <strong>Release Date:</strong>{" "}
                {detailedMovie.release_date || "N/A"}
              </p>
              <p>
                <strong>Director:</strong> {detailedMovie.director}
              </p>
            </div>

            <button
              className="bg-red-600 hover:bg-red-700 cursor-pointer text-white font-bold py-3 px-8 rounded transition duration-200 text-xl"
              onClick={goToHomepage}
            >
              Watch Now
            </button>
          </div>
        </div>
      </section>

      {trailerKey && (
        <section className="max-w-7xl mx-auto p-8 md:p-16 pt-0">
          <h2
            className="text-3xl font-bold mb-8"
            style={{ paddingTop: "20px" }}
          >
            Official Trailer
          </h2>
          <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${trailerKey}`}
              title={`${detailedMovie.title} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>
      )}

      {similarMovies.length > 0 && (
        <section className="max-w-7xl mx-auto p-8 md:p-16 pt-0">
          <h2 className="text-3xl font-bold mb-8">More Like This</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {similarMovies.map((movie) => (
              <div key={movie.id}>
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MovieDetails;
