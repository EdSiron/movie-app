import React from "react";
import { Link } from "react-router-dom";

const MovieCard = ({
  movie: {
    id,
    title,
    name, 
    release_date,
    first_air_date,
    vote_average,
    poster_path,
    original_language,
    media_type,
  },
}) => {
  const displayTitle = title || name;
  const date = release_date || first_air_date;
  const displayYear = date ? date.split("-")[0] : "N/A";
  const isTV = media_type === 'tv' || (!media_type && name && !title);
  const mediaTypeForLink = isTV ? 'tv' : 'movie';
  
  if (!displayTitle) return null; 

  return (
    <div className="movie-card">
      <Link to={`/${mediaTypeForLink}/${id}`}>
        <img
          src={
            poster_path
              ? `https://image.tmdb.org/t/p/w500/${poster_path}`
              : "/movie-app/no-movie.png"
          }
          alt={displayTitle}
        />

        <div className="mt-4">
          <h3 className="line-clamp-2">{displayTitle}</h3>
          <div className="content flex flex-row items-center flex-wrap gap-2">
            <div className="rating flex flex-row items-center gap-1">
              <img
                src="/movie-app/star.svg"
                alt="Star Icon"
                className="w-4 h-4 object-contain"
              />
              <p className="font-bold text-sm sm:text-base text-white">
                {vote_average ? vote_average.toFixed(1) : "N/A"}
              </p>
            </div>
            
            {(media_type || isTV) && ( 
                <>
                    <span className="text-sm text-gray-100 hidden sm:inline">•</span>
                    <p className="media-type capitalize text-gray-100 font-bold text-sm sm:text-base">
                        {mediaTypeForLink === 'tv' ? 'TV' : 'Movie'}
                    </p>
                </>
            )}

            <span className="text-sm text-gray-100 hidden sm:inline">•</span>
            <p className="lang capitalize text-gray-100 font-medium text-sm sm:text-base">
              {original_language}
            </p>
            <span className="text-sm text-gray-100 hidden sm:inline">•</span>
            <p className="year text-gray-100 font-medium text-sm sm:text-base">
              {displayYear}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;