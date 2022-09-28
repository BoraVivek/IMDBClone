(function () {

    let movies = JSON.parse(window.localStorage.getItem('movies')) || [];
    let favouriteMovies = window.localStorage.getItem('favourite-movies') || [];
    const moviesList = document.querySelector("#movies-list");
    const searchBox = document.querySelector('#search_box');
    let searchResults = [];
    const searchResultContainer = document.querySelector('#search-results');

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
        article.classList.add('movie', 'flex', 'relative', 'gap-2', 'pb-5', 'border-b-2');
        article.id = `movie-${movie.id}`;
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
                <div class="movie-title text-3xl hover:text-slate-800 cursor-pointer" title="Movie Title">${movie.title}</div>
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

    async function searchMovie(e) {
        console.log("Searching Movie...", e.target.value);
        searchResults = [];
        searchResultContainer.classList.add('hidden');

        let searchText = e.target.value;
        const response = await fetch(`${API_URL}/?apikey=${API_KEY}&s=${searchText}`);
        const data = await response.json();

        if (data.Response != 'False') {
            searchResults.push(...data.Search);
        }

        if (searchResults.length > 0) {
            searchResultContainer.classList.remove('hidden');
        }

        console.log("Search Data", data);
        console.log("Search Results", searchResults);

        searchResults.forEach((movie) => {
            addSearchResultToDOM(movie);
        })
    }



    /** Function to Add Search Result to DOM */
    function addSearchResultToDOM(movie) {
        const div = document.createElement('div');
        div.classList.add("search-item", "flex", "p-2", 'gap-3', 'text-white', 'border-b-2', 'items-center', 'justify-between');
        div.innerHTML = `
            <div class="flex gap-3">
                <img src="${movie.Poster ? movie.Poster : './img/no-poster-available.jpg'}" 
                    alt="${movie.Title}" class="h-24 w-20 rounded">
                <div class="movie-info">
                    <div class="movie-title text-lg" title="Movie Title">${movie.Title}</div>
                    <div class="movie-year text-sm text-gray-400" title="Release Year">${movie.Year}</div>
                </div>
            </div>
            <button class='addMovieToList' data-movieId=${movie.imdbID}>
                <i class="fas fa-plus-circle text-2xl pointer-events-none" title="Add Movie to List"></i>
            </button>
        `;

        searchResultContainer.append(div);
    }

    function test() {
        alert("Hello");
    }

    /** Function to add Movie to the list from the search results */
    async function addMovieToList(movieId) {
        console.log("Movie ID:", movieId);
        if (!movieId) {
            return;
        }

        let movieExists = movies.find((movie) => movie.id == movieId);

        if(movieExists){
            alert("Movie Already Exists!");
            return;
        }

        let response = await fetch(`${API_URL}/?apikey=${API_KEY}&i=${movieId}`);
        let data = await response.json();

        if (data.Response == 'False') {
            return;
        }

        //Creating new Movie Object
        let newMovie = {
            id: data.imdbID,
            title: data.Title,
            year: data.Year,
            runTime: data.Runtime,
            genre: data.Genre,
            plot: data.Plot,
            poster: data.Poster,
            imdbRating: data.imdbRating,
            rottenTomatoes: data.Ratings.find((rating) => rating.Source == 'Rotten Tomatoes')?.Value || "N/A"
        }

        //Adding Movie to the Movies Array, and in the Localstorge
        addMovie(newMovie);

        //Adding movie to the DOM
        addMovieToDOM(newMovie);
    }

    function removeFromFavourite(movie) {

    }

    /** Function to load initial movies */
    function loadInitialMovies() {
        console.log("Loading Movies...");
        console.log("Movies", movies);

        // Check if initial movies exist
        if (movies.length == 0) {

            //If initial movies don't exist, than we load some default movies in UI
            const INITIAL_MOVIES = [
                'tt6277462', 'tt8178634', 'tt10028196'
            ];

            //Looping through all Movie IDs, and fetching their Data
            INITIAL_MOVIES.forEach(async (movie) => {
                let response = await fetch(`${API_URL}/?apikey=${API_KEY}&i=${movie}&plot=full`);
                let data = await response.json();

                //Creating new Movie Object
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

                //Adding Movie to the Movies Array, and in the Localstorge
                addMovie(newMovie);

                //Adding movie to the DOM
                addMovieToDOM(newMovie);
            })
        } else {
            /** If movies exists in localstorage, than we render them in the DOM */
            movies.forEach((movie) => {
                addMovieToDOM(movie);
            })
        }
    }

    function handleClickEvent(e) {
        let target = e.target;

        switch (target.className) {
            case "addMovieToList":
                let movieId = target.dataset.movieid;
                addMovieToList(movieId);
                break;
            default:
                console.log("No Event");
                break;
        }
    }

    /** Initialize Application */
    function initializeApp() {
        loadInitialMovies();
        searchBox.addEventListener("change", searchMovie); //Adding onChange event to searchBox for handling search 
        document.addEventListener("click", handleClickEvent);
    }

    initializeApp();

})();