"use strict";

class Movies {
    constructor() {
        this.movies = JSON.parse(window.localStorage.getItem('movies')) || [];
        this.moviesList = document.querySelector("#movies-list");
        this.searchBox = document.querySelector('#search_box');
        this.searchResults = [];
        this.searchResultContainer = document.querySelector('#search-results');

        this.API_URL = "http://www.omdbapi.com/?apikey=f3096691";
        // this.API_KEY = 'f3096691';
    }

    addMovie(movie) {
        console.log("Movie from addMovie:", movie)
        this.movies.push(movie);
        this.addMovieToDOM(this.moviesList, movie);
        this.updateLocalStorageMovies();

    }

    updateMovies(moviesList) {
        if (moviesList.length >= 0) {
            this.movies = moviesList;

            this.updateLocalStorageMovies();
        }
    }

    updateLocalStorageMovies() {
        window.localStorage.setItem('movies', JSON.stringify(this.movies));
    }

    addMovieToDOM(domElement, movie) {
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
                    <button class='${movie.favourite ? 'bg-red-800' : 'bg-slate-900'} text-white px-2 py-1 rounded toggleFavourite' data-movieid='${movie.id}'> <i class='${movie.favourite ? 'fas' : 'far'} fa-heart pointer-events-none'></i> ${movie.favourite ? 'Remove from Favourite' : 'Add to Favourite'}</button>
                    <button class="bg-red-800 text-white px-2 py-1 rounded deleteMovie" data-movieid="${movie.id}"><i class="fas fa-trash pointer-events-none"></i> Delete</button>
                </div>
            </div>
        `;

        domElement.append(article);
    }

    removeMovieFromDom() {
        let movieElement = document.querySelector(`#movie-${movieId}`);
        if (!movieElement) {
            alert("No Movie Found with this ID");
            return;
        }

        movieElement.remove();
    }

    deleteMovie(movieId) {
        let leftMovies = this.movies.filter((movie) => movie.id != movieId);
        this.updateMovies(leftMovies);

        this.removeMovieFromDom(movieId);
    }

    toggleFavourite(movieId) {
        let isFavourite = false;
        this.movies.map((movie) => {
            if (movie.id == movieId) {
                movie.favourite = !movie.favourite;
                isFavourite = movie.favourite;
            }
            return movie;
        })

        let movieElement = document.querySelector(`#movie-${movieId} .toggleFavourite`);
        if (isFavourite) {
            movieElement.classList.remove("bg-slate-900");
            movieElement.classList.add("bg-red-800");
            movieElement.innerHTML = `
                    <i class="fas fa-heart pointer-events-none"></i> Remove from Favourite
                `;
        } else {
            movieElement.classList.remove("bg-red-800");
            movieElement.classList.add("bg-slate-900");
            movieElement.innerHTML = `
                    <i class="far fa-heart pointer-events-none"></i> Add to Favourite
                `;
        }

        this.updateMovies(this.movies);
    }

    async searchMovie(e) {
        console.log("Searching Movie...", e.target.value);
        let searchResults = [];
        this.searchResultContainer.classList.add('hidden');

        let searchText = e.target.value;
        const response = await fetch(`${this.API_URL}&s=${searchText}`);
        const data = await response.json();

        if (data.Response != 'False') {
            searchResults.push(...data.Search);
        }

        if (searchResults.length > 0) {
            this.searchResultContainer.classList.remove('hidden');
        }

        // console.log("Search Data", data);
        // console.log("Search Results", searchResults);

        searchResults.forEach((movie) => {
            this.addSearchResultToDOM(movie);
        })
    }

    /** Function to Add Search Result to DOM */
    addSearchResultToDOM(movie) {
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

        this.searchResultContainer.append(div);
    }

    /** Function to add Movie to the list from the search results */
    async addMovieToList(movieId) {
        console.log("Movie ID:", movieId);
        if (!movieId) {
            return;
        }

        /** Check if movie already present with that MovieID to prevent duplicates */
        let movieExists = this.movies.find((movie) => movie.id == movieId);
        if (movieExists) {
            alert("Movie Already Exists!");
            return;
        }

        /** Fetch Movie Data */
        let response = await fetch(`${this.API_URL}&i=${movieId}`);
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
            rottenTomatoes: data.Ratings.find((rating) => rating.Source == 'Rotten Tomatoes')?.Value || "N/A",
            favourite: false
        }

        //Adding Movie to the Movies Array, and in the Localstorge
        this.addMovie(newMovie);
    }

    /** Function to load initial movies when the movies list is empty */
    loadInitialMovies() {
        console.log("Loading Movies...");
        console.log("Movies", this.movies);

        // Check if initial movies exist
        if (this.movies.length == 0) {

            //If initial movies don't exist, than we load some default movies in UI
            const INITIAL_MOVIES = [
                'tt6277462', 'tt8178634', 'tt10028196'
            ];

            //Looping through all Movie IDs, and fetching their Data
            INITIAL_MOVIES.forEach(async (movie) => {
                let response = await fetch(`${this.API_URL}&i=${movie}&plot=full`);
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
                    rottenTomatoes: data.Ratings.find((rating) => rating.Source == 'Rotten Tomatoes').Value,
                    favourite: false,
                }

                //Adding Movie to the Movies Array, and in the Localstorge
                this.addMovie(newMovie);
            })
        } else {
            /** If movies exists in localstorage, than we render them in the DOM */
            this.movies.forEach((movie) => {
                this.addMovieToDOM(this.moviesList, movie);
            })
        }
    }

    // Function to handle Click Events
    handleClickEvent(e) {
        let target = e.target;
        let movieId = target.dataset.movieid;
        console.log("Event:", e.target);

        // Handles Add Movie to List
        if (target.classList.contains('addMovieToList')) {
            this.addMovieToList(movieId);
            return;
        }

        // Handles Delete Movie Click
        if (target.classList.contains('deleteMovie')) {
            this.deleteMovie(movieId);
            return;
        }

        // Handles Toggle Favourite Click
        if (target.classList.contains("toggleFavourite")) {
            this.toggleFavourite(movieId);
            return;
        }
    }
}



// function addMovie(movie) {
//     movies.push(movie);
//     //Adding movie to the DOM
//     addMovieToDOM(movie);
//     updateLocalStorageMovies();
// }

// function updateMovies(moviesList) {
//     if (moviesList.length >= 0) {
//         movies = moviesList;

//         updateLocalStorageMovies();
//     }
// }

// function updateLocalStorageMovies() {
//     window.localStorage.setItem('movies', JSON.stringify(movies));
// }



// function addMovieToDOM(movie) {
//     const article = document.createElement('article');
//     article.classList.add('movie', 'flex', 'relative', 'gap-2', 'pb-5', 'border-b-2');
//     article.id = `movie-${movie.id}`;
//     article.innerHTML = `
//         <div class="image-poster relative h-52">
//             <img src="${movie.poster}"
//                 alt="${movie.title}" class="h-52 w-auto hover:scale-110 transition-all duration-300">
//             <div class="movie-runtime absolute bottom-0 right-0 px-2 rounded-tl-md bg-gray-600 opacity-80 text-white"
//                 title="Movie Runtime">${movie.runTime}</div>
//             <div class="movie-year absolute top-0 right-0 px-1 bg-cyan-700 text-white rounded-bl-md bg-opacity-95"
//                 title="Release Year">${movie.year}</div>
//         </div>
//         <div class="movie-info text-white flex flex-col justify-between w-full">
//             <div class="movie-detail">
//                 <div class="movie-title text-3xl hover:text-slate-800 cursor-pointer" title="Movie Title">${movie.title}</div>
//                 <div class="movie-genre">${movie.genre}</div>
//                 <div class="movie-plot" title="Movie Plot">
//                     ${movie.plot}
//                 </div>
//                 <div class="ratings mt-4 flex gap-5">
//                     <div class="imdb_ratings" title="IMDB Rating"><i class="fas fa-star text-yellow-400"></i> ${movie.imdbRating}</div>
//                     <div class="rotten_tomatoes flex gap-1 items-center" title="Rotten Tomatoes"> <img src="./img/rotten-tomato.svg" class="h-5" alt=""> ${movie.rottenTomatoes}</div>
//                 </div>
//             </div>

//             <div class="movie-options flex gap-2 justify-end">
//                 <button class='${movie.favourite ? 'bg-red-800' : 'bg-slate-900'} text-white px-2 py-1 rounded toggleFavourite' data-movieid='${movie.id}'> <i class='${movie.favourite ? 'fas' : 'far'} fa-heart pointer-events-none'></i> ${movie.favourite ? 'Remove from Favourite' : 'Add to Favourite'}</button>
//                 <button class="bg-red-800 text-white px-2 py-1 rounded deleteMovie" data-movieid="${movie.id}"><i class="fas fa-trash pointer-events-none"></i> Delete</button>
//             </div>
//         </div>
//         `;

//     moviesList.append(article);
// }

// function removeMovieFromDom(movieId) {
//     let movieElement = document.querySelector(`#movie-${movieId}`);
//     if (!movieElement) {
//         alert("No Movie Found with this ID");
//         return;
//     }

//     movieElement.remove();
// }

// function deleteMovie(movieId) {
//     let leftMovies = movies.filter((movie) => movie.id != movieId);
//     updateMovies(leftMovies);

//     removeMovieFromDom(movieId);
// }

// function toggleFavourite(movieId) {
//     isFavourite = false;
//     movies.map((movie) => {
//         if (movie.id == movieId) {
//             movie.favourite = !movie.favourite;
//             isFavourite = movie.favourite;
//         }
//         return movie;
//     })

//     let movieElement = document.querySelector(`#movie-${movieId} .toggleFavourite`);
//     if (isFavourite) {
//         movieElement.classList.remove("bg-slate-900");
//         movieElement.classList.add("bg-red-800");
//         movieElement.innerHTML = `
//                 <i class="fas fa-heart pointer-events-none"></i> Remove from Favourite
//             `;
//     } else {
//         movieElement.classList.remove("bg-red-800");
//         movieElement.classList.add("bg-slate-900");
//         movieElement.innerHTML = `
//                 <i class="far fa-heart pointer-events-none"></i> Add to Favourite
//             `;
//     }

//     updateMovies(movies);
// }

// async function searchMovie(e) {
//     console.log("Searching Movie...", e.target.value);
//     searchResults = [];
//     searchResultContainer.classList.add('hidden');

//     let searchText = e.target.value;
//     const response = await fetch(`${API_URL}/?apikey=${API_KEY}&s=${searchText}`);
//     const data = await response.json();

//     if (data.Response != 'False') {
//         searchResults.push(...data.Search);
//     }

//     if (searchResults.length > 0) {
//         searchResultContainer.classList.remove('hidden');
//     }

//     console.log("Search Data", data);
//     console.log("Search Results", searchResults);

//     searchResults.forEach((movie) => {
//         addSearchResultToDOM(movie);
//     })
// }



// /** Function to Add Search Result to DOM */
// function addSearchResultToDOM(movie) {
//     const div = document.createElement('div');
//     div.classList.add("search-item", "flex", "p-2", 'gap-3', 'text-white', 'border-b-2', 'items-center', 'justify-between');
//     div.innerHTML = `
//             <div class="flex gap-3">
//                 <img src="${movie.Poster ? movie.Poster : './img/no-poster-available.jpg'}"
//                     alt="${movie.Title}" class="h-24 w-20 rounded">
//                 <div class="movie-info">
//                     <div class="movie-title text-lg" title="Movie Title">${movie.Title}</div>
//                     <div class="movie-year text-sm text-gray-400" title="Release Year">${movie.Year}</div>
//                 </div>
//             </div>
//             <button class='addMovieToList' data-movieId=${movie.imdbID}>
//                 <i class="fas fa-plus-circle text-2xl pointer-events-none" title="Add Movie to List"></i>
//             </button>
//         `;

//     searchResultContainer.append(div);
// }

// /** Function to add Movie to the list from the search results */
// async function addMovieToList(movieId) {
//     console.log("Movie ID:", movieId);
//     if (!movieId) {
//         return;
//     }

//     /** Check if movie already present with that MovieID to prevent duplicates */
//     let movieExists = movies.find((movie) => movie.id == movieId);
//     if (movieExists) {
//         alert("Movie Already Exists!");
//         return;
//     }

//     /** Fetch Movie Data */
//     let response = await fetch(`${API_URL}/?apikey=${API_KEY}&i=${movieId}`);
//     let data = await response.json();

//     if (data.Response == 'False') {
//         return;
//     }

//     //Creating new Movie Object
//     let newMovie = {
//         id: data.imdbID,
//         title: data.Title,
//         year: data.Year,
//         runTime: data.Runtime,
//         genre: data.Genre,
//         plot: data.Plot,
//         poster: data.Poster,
//         imdbRating: data.imdbRating,
//         rottenTomatoes: data.Ratings.find((rating) => rating.Source == 'Rotten Tomatoes')?.Value || "N/A",
//         favourite: false
//     }

//     //Adding Movie to the Movies Array, and in the Localstorge
//     addMovie(newMovie);
// }


// /** Function to load initial movies when the movies list is empty */
// function loadInitialMovies() {
//     console.log("Loading Movies...");
//     console.log("Movies", movies);

//     // Check if initial movies exist
//     if (movies.length == 0) {

//         //If initial movies don't exist, than we load some default movies in UI
//         const INITIAL_MOVIES = [
//             'tt6277462', 'tt8178634', 'tt10028196'
//         ];

//         //Looping through all Movie IDs, and fetching their Data
//         INITIAL_MOVIES.forEach(async (movie) => {
//             let response = await fetch(`${API_URL}/?apikey=${API_KEY}&i=${movie}&plot=full`);
//             let data = await response.json();

//             //Creating new Movie Object
//             let newMovie = {
//                 id: data.imdbID,
//                 title: data.Title,
//                 year: data.Year,
//                 runTime: data.Runtime,
//                 genre: data.Genre,
//                 plot: data.Plot,
//                 poster: data.Poster,
//                 imdbRating: data.imdbRating,
//                 rottenTomatoes: data.Ratings.find((rating) => rating.Source == 'Rotten Tomatoes').Value,
//                 favourite: false,
//             }

//             //Adding Movie to the Movies Array, and in the Localstorge
//             addMovie(newMovie);
//         })
//     } else {
//         /** If movies exists in localstorage, than we render them in the DOM */
//         movies.forEach((movie) => {
//             addMovieToDOM(movie);
//         })
//     }
// }

// // Function to handle Click Events
// function handleClickEvent(e) {
//     let target = e.target;
//     let movieId = target.dataset.movieid;
//     console.log("Event:", e.target);

//     // Handles Add Movie to List
//     if (target.classList.contains('addMovieToList')) {
//         addMovieToList(movieId);
//         return;
//     }

//     // Handles Delete Movie Click
//     if (target.classList.contains('deleteMovie')) {
//         deleteMovie(movieId);
//         return;
//     }

//     // Handles Toggle Favourite Click
//     if (target.classList.contains("toggleFavourite")) {
//         toggleFavourite(movieId);
//         return;
//     }
// }



