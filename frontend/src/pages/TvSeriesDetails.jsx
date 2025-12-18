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
    if (response.status === 404) {
      throw new Error("TV series not found.");
    }
    throw new Error("Failed to fetch data");
  }
  return response.json();
};

const TvSeriesDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detailedSeries, setDetailedSeries] = useState(null);
  const [similarSeries, setSimilarSeries] = useState([]);
  const [trailerKey, setTrailerKey] = useState(null);
  const [homepage, setHomepage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAllDetails = async (tvId) => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const tvDetailsPromise = fetchData(`${API_BASE_URL}/tv/${tvId}`);
      const similarTvPromise = fetchData(`${API_BASE_URL}/tv/${tvId}/similar`);
      const creditsPromise = fetchData(`${API_BASE_URL}/tv/${tvId}/credits`);
      const videosPromise = fetchData(`${API_BASE_URL}/tv/${tvId}/videos`);

      const [details, similar, credits, videos] = await Promise.all([
        tvDetailsPromise,
        similarTvPromise,
        creditsPromise,
        videosPromise,
      ]);

      const creator = credits.crew.find(
        (crew) => crew.job === "Series Creator"
      );

      const trailer = videos.results.find(
        (video) => video.type === "Trailer" && video.site === "YouTube"
      );

      setDetailedSeries({ ...details, creator: creator?.name || "N/A" });
      setHomepage(details.homepage);
      setSimilarSeries(similar.results.slice(0, 6) || []);
      setTrailerKey(trailer?.key || null);
    } catch (error) {
      console.error(`Error fetching TV series details: ${error}`);
      setErrorMessage(
        error.message ||
          "Error fetching TV series details. Please try again later."
      );
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
  if (!detailedSeries) return null;

  const backgroundImageUrl = detailedSeries?.backdrop_path
    ? `https://image.tmdb.org/t/p/original/${detailedSeries.backdrop_path}`
    : "";

  const posterImageUrl = detailedSeries?.poster_path
    ? `https://image.tmdb.org/t/p/w500/${detailedSeries.poster_path}`
    : "/no-movie.png";

  const genres = detailedSeries.genres.map((g) => (
    <span key={g.id} className="border-2 mr-2 px-2 py-1 rounded">
      {g.name}
    </span>
  ));

  const creator = detailedSeries.created_by.map((g) => g.name).join(" | ");

  const rating = detailedSeries.vote_average
    ? detailedSeries.vote_average.toFixed(1)
    : "N/A";

  const seriesTitle = detailedSeries.name || "N/A";
  const releaseDate = detailedSeries.first_air_date || "N/A";
  const status = detailedSeries.status || "N/A";
  const numSeasons = detailedSeries.number_of_seasons;
  const numEpisodes = detailedSeries.number_of_episodes;

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
              alt={seriesTitle}
              className="rounded-lg shadow-2xl"
            />
          </div>

          <div className="w-full text-white">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-2 leading-tight">
              {seriesTitle}
            </h2>
            <p className="text-xl font-light text-gray-400 mb-4">
              {detailedSeries.tagline}
            </p>

            <div className="flex items-center space-x-4 mb-4">
              <span className="text-xl font-bold">⭐ {rating}</span>
              <span className="text-lg text-gray-400">|</span>
              <span className="text-xl font-light">{genres}</span>
            </div>

            <p className="text-gray-300 max-w-2xl mb-6 text-base line-clamp-3 md:line-clamp-none">
              {detailedSeries.overview}
            </p>

            <div className="space-y-2 mb-8 text-lg">
              <p>
                <strong>First Air Date:</strong> {releaseDate}
              </p>
              <p>
                <strong>Seasons:</strong> {numSeasons || "N/A"}
              </p>
              <p>
                <strong>Episodes:</strong> {numEpisodes || "N/A"}
              </p>
              <p>
                <strong>Status:</strong> {status}
              </p>
              <p>
                <strong>Creator:</strong> {creator}
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
              title={`${seriesTitle} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>
      )}

      {similarSeries.length > 0 && (
        <section className="max-w-7xl mx-auto p-8 md:p-16 pt-0">
          <h2 className="text-3xl font-bold mb-8">More Like This</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {similarSeries.map((series) => (
              <div key={series.id}>
                <MovieCard movie={series} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default TvSeriesDetails;
