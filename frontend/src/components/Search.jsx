import React from "react";

const Search = ({ searchTerm, setSearchTerm, onSearchSubmit }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearchSubmit(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    onSearchSubmit("");
  };

  return (
    <div className="search">
      <form onSubmit={handleSubmit}>
        <div className="flex text-center justify-between">
          <img
            src="search.svg"
            alt="search"
            className="cursor-pointer"
            onClick={handleSubmit}
          />
          <input
            type="text"
            placeholder="Search through thousands of movies"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {searchTerm.length > 0 && (
            <img
              src="close.svg"
              alt="clear search"
              onClick={handleClearSearch}
              className="clear-icon"
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default Search;
