(function () {
    let movies = JSON.parse(window.localStorage.getItem('movies')) || [];
    let favouriteMovies = window.localStorage.getItem('favourite-movies') || [];
    const moviesList = document.querySelector("#movies-list");
    const searchBox = document.querySelector('#search_box');
    const searchResults = [];

    const API_URL = "http://www.omdbapi.com";
    const API_KEY = 'f3096691';

    function addMovie(movie) {
        movies.push(movie);
        updateLocalStorageMovies();
    }

    function updateLocalStorageMovies() {
        console.log(movies);
        window.localStorage.setItem('movies', JSON.stringify(movies));
    }

    function addMovieToDOM(movie) {
        const article = document.createElement('article');
        article.classList.add('movie', 'flex', 'relative', 'gap-2','pb-5', 'border-b-2');
        article.innerHTML = `
        <div class="image-poster relative h-52">
            <img src="${movie.poster}"
                alt="${movie.title}" class="h-52 w-auto hover:scale-110 transition-all duration-300">
            <div class="movie-runtime absolute bottom-0 right-0 px-2 rounded-tl-md bg-gray-600 opacity-80 text-white"
                title="Movie Runtime">${movie.runTime}</div>
            <div class="movie-year absolute top-0 right-0 px-1 bg-cyan-700 text-white rounded-bl-md bg-opacity-95"
                title="Release Year">${movie.year}</div>
        </div>
        <div class="movie-info text-white flex flex-col justify-between w-full">
            <div class="movie-detail">
                <div class="movie-title text-3xl" title="Movie Title">${movie.title}</div>
                <div class="movie-genre">${movie.genre}</div>
                <div class="movie-plot" title="Movie Plot">
                    ${movie.plot}
                </div>
                <div class="ratings mt-4 flex gap-5">
                    <div class="imdb_ratings" title="IMDB Rating"><i class="fas fa-star text-yellow-400"></i> ${movie.imdbRating}</div>
                    <div class="rotten_tomatoes flex gap-1 items-center" title="Rotten Tomatoes"> <img src="./img/rotten-tomato.svg" class="h-5" alt=""> ${movie.rottenTomatoes}</div>
                </div>
            </div>

            <div class="movie-options flex gap-2 justify-end">
                <button class="bg-slate-900 text-white px-2 py-1 rounded"> <i class="far fa-heart"></i> Add to Favourites</button>
                <button class="bg-red-800 text-white px-2 py-1 rounded"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
        `;

        moviesList.append(article);
    }

    function removeMovie(movie) {

    }

    function addToFavourite(movie) {

    }

    async function searchMovie(e){
        console.log("Searching Movie...", e.target.value);
        let searchText = e.target.value;
        const response = await fetch(`${API_URL}/?apikey=${API_KEY}&s=${searchText}&type=movie`);
        const data = await response.json();

        console.log("Search Data", data);
    }

    function removeFromFavourite(movie) {

    }

    function loadInitialMovies() {
        console.log("Loading Movies...");
        console.log("Movies",movies);

        if (movies.length == 0) {
            const INITIAL_MOVIES = [
                'tt6277462', 'tt8178634', 'tt10028196'
            ];

            console.log(INITIAL_MOVIES);

            INITIAL_MOVIES.forEach(async (movie) => {
                let response = await fetch(`${API_URL}/?apikey=${API_KEY}&i=${movie}&type=movie&plot=full`);
                let data = await response.json();

                console.log(data);

                let newMovie = {
                    id: data.imdbID,
                    title: data.Title,
                    year: data.Year,
                    runTime: data.Runtime,
                    genre: data.Genre,
                    plot: data.Plot,
                    poster: data.Poster,
                    imdbRating: data.imdbRating,
                    rottenTomatoes: data.Ratings.find((rating) => rating.Source == 'Rotten Tomatoes').Value
                }

                console.log(newMovie);

                addMovie(newMovie);
                addMovieToDOM(newMovie);
            })
        } else {
            movies.forEach((movie) => {
                addMovieToDOM(movie);
            })
        }
    }

    function initializeApp() {
        loadInitialMovies();
        searchBox.addEventListener("change", searchMovie);
    }

    initializeApp();
})()