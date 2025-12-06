import React from "react";
import { Link } from "react-router-dom";

const MovieCard = ({
  movie: {
    id,
    title,
    vote_average,
    poster_path,
    release_date,
    original_language,
  },
}) => {
  return (
    <div className="movie-card">
      <Link to={`/movie/${id}`}>
        <img
          src={
            poster_path
              ? `https://image.tmdb.org/t/p/w500/${poster_path}`
              : "/no-movie.png"
          }
          alt={title}
        />

        <div className="mt-4">
          <h3 className="line-clamp-2">{title}</h3>
          <div className="content flex flex-row items-center flex-wrap gap-2">
            <div className="rating flex flex-row items-center gap-1">
              <img
                src="/star.svg"
                alt="Star Icon"
                className="w-4 h-4 object-contain"
              />
              <p className="font-bold text-sm sm:text-base text-white">
                {vote_average ? vote_average.toFixed(1) : "N/A"}
              </p>
            </div>

            <span className="text-sm text-gray-100 hidden sm:inline">•</span>
            <p className="lang capitalize text-gray-100 font-medium text-sm sm:text-base">
              {original_language}
            </p>
            <span className="text-sm text-gray-100 hidden sm:inline">•</span>
            <p className="year text-gray-100 font-medium text-sm sm:text-base">
              {release_date ? release_date.split("-")[0] : "N/A"}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;
