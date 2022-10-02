class Favourite extends Movies {

    // Favourite Constructor
    constructor() {
        super();
        this.favouriteMovies = this.movies.filter((movie) => movie.favourite == true)
        this.favouriteMoviesList = document.querySelector("#favourite-movies-list");
    }

    // Loads Favourite Movies to the DOM
    loadFavouriteMovies() {
        // If no favourite movies, display a message for the same
        if (this.favouriteMovies.length == 0) {
            this.favouriteMoviesList.append("No Favourite Movies to Show...");
        }

        // Loop through all movies, add them to the DOM
        this.favouriteMovies.forEach((movie) => {
            this.addMovieToDOM(this.favouriteMoviesList, movie);
        })
    }

    //Overriding ToggleFavourite Method on Favourite Class
    toggleFavourite(movieId) {
        super.toggleFavourite(movieId);

        // Refreshing the page when a movie is removed from Favourites
        location.reload();
    }

    // Overriding delete movie function to reload the page on delete
    deleteMovie(movieId){
        super.deleteMovie(movieId);

        location.reload();
    }


}