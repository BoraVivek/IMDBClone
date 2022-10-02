class Detail extends Movies {
    constructor() {
        super();

        //Fetching the ID Params from URL
        let address = window.location.search;
        this.movieId = new URLSearchParams(address).get('id');
    }

    //Fetches movie to display and add it to dom
    async loadMovieDetail() {
        let newMovie = await this.fetchMovieToDisplay(this.movieId);
        this.addMovieDetailToDOM(newMovie);
    }

    //Fetches movie which needs to be added in dom
    async fetchMovieToDisplay() {
        let movieId = this.movieId;
        console.log("Movie ID:", movieId);
        if (!this.movieId) {
            return;
        }

        let newMovie = {};

        /** Fetch Movie Data */
        let response = await fetch(`${this.API_URL}&i=${movieId}&plot=full`);
        let data = await response.json();

         /** Check if movie already present with that MovieID  */
         let movieExists = this.movies.find((movie) => movie.id == movieId);
         if (movieExists) {
             newMovie = movieExists;
             newMovie.plot = data.Plot;

             return newMovie;
         }

        
        if (data.Response == 'False') {
            return;
        }

        //Creating new Movie Object
        newMovie = {
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

        return newMovie;
    }

    //Check if Movie Exists in the Movies List
    isMovieExistsInList(movie){
        let movieExists = this.movies.find((m) => m.id == movie.id);

        if(movieExists){
            return true;
        }

        return false;
    }

    //Add Movies detail to DOM
    addMovieDetailToDOM(movie) {
        const article = document.createElement('article');
        article.classList.add('movie', 'flex', 'relative', 'gap-5', 'pb-5', 'border-b-2');
        article.id = `movie-${movie.id}`;

        const genre = movie.genre.split(", ");
        
        let movieExists = this.isMovieExistsInList(movie);

        article.innerHTML = `
            <div class="movie-img basis-[50%]">
                <img src="${movie.poster}" alt="${movie.title}" >
            </div>
            <div class="movie-details basis-[100%]">
                <div class="movie-title text-4xl">${movie.title} (${movie.year})</div>
                <div class="movie-genre flex gap-2 mt-2">${genre.map((g) => `<div class="bg-gray-800 px-2 py-1 text-xs rounded">${g}</div>`).join("")}</div>
                <div class="ratings mt-2 flex gap-5">
                    <div class="imdb_ratings" title="IMDB Rating"><i class="fas fa-star text-yellow-400"></i> ${movie.imdbRating}</div>
                    <div class="rotten_tomatoes flex gap-1 items-center" title="Rotten Tomatoes"> <img src="./img/rotten-tomato.svg" class="h-5" alt=""> ${movie.rottenTomatoes}</div>
                </div>
                <div class="movie-plot mt-4">
                    ${movie.plot}
                </div>
                ${movieExists ? 
                    `<div class="movie-options flex gap-2 justify-end mt-8">
                        <button class='${movie.favourite ? 'bg-red-800' : 'bg-slate-900'} text-white px-2 py-1 rounded toggleFavourite' data-movieid='${movie.id}'> <i class='${movie.favourite ? 'fas' : 'far'} fa-heart pointer-events-none'></i> ${movie.favourite ? 'Remove from Favourite' : 'Add to Favourite'}</button>
                        <button class="bg-red-800 text-white px-2 py-1 rounded deleteMovie" data-movieid="${movie.id}"><i class="fas fa-trash pointer-events-none"></i> Delete</button>
                    </div>` 
                    : 
                    `<div class='flex gap-2 justify-end mt-8'>
                        <button class='bg-slate-900 addMovieToListFromDetail text-white px-2 py-1 rounded' title='Add Movie to List' data-movieid='${movie.id}'> 
                            <i class='fas fa-plus-circle pointer-events-none'></i> 
                            Add Movie to List
                        </button>

                        <button class="bg-red-800 text-white px-2 py-1 rounded addMovieToFavouriteFromDetail" data-movieid="${movie.id}">
                            <i class="far fa-heart pointer-events-none"></i> 
                            Add to Favourite
                        </button>
                    </div>`
                }
            </div>
        `;

        let detailElement = document.querySelector("#movie-detail");
        detailElement.append(article);
    }

    //Overriding the HandleClick Event Function
    handleClickEvent(e) {
        super.handleClickEvent(e);

        // Handles Add Movie to List from Details
        if (e.target.classList.contains('addMovieToListFromDetail')) {
            this.addMovieToListFromDetail(this.movieId);
            return;
        }

        // Handles Add Movie to Favourite from Details
        if (e.target.classList.contains('addMovieToFavouriteFromDetail')) {
            this.addMovieToFavouriteFromDetail(this.movieId);
            return;
        }
    }

    //Function to add Movie to Movie List from Detail
    async addMovieToListFromDetail(movieId){
        let movie = await this.fetchMovieToAdd(movieId);
        console.log("Movie :", movie);
        this.addMovieFromDetail(movie);
        
        alert("Movie Successfully added to list");
        location.reload();
    }

    //Function to add Movie to Favourite List from Details
    async addMovieToFavouriteFromDetail(movieId){
        let movie = await this.fetchMovieToAdd(movieId);
        movie.favourite = true;
        this.addMovieFromDetail(movie);

        alert("Movie successfully added to favourite list");
        location.reload();
    }

    //Function to Update the Movie List and LocalStorage
    addMovieFromDetail(movie) {
        console.log("Movie from addMovie:", movie)
        this.movies.push(movie);
        // this.addMovieToDOM(this.moviesList, movie);
        this.updateLocalStorageMovies();
    }

    // Overriding delete movie function to reload the page on delete
    deleteMovie(movieId){
        super.deleteMovie(movieId);

        alert("Movie Delete Successfully");
        location.reload();
    }
}