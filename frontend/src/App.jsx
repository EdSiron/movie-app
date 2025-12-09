import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MovieDetails from "./pages/MovieDetails";
import TvSeriesDetails from "./pages/TvSeriesDetails";

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/tv/:id" element={<TvSeriesDetails />} />
        </Routes>
    );
};

export default App;