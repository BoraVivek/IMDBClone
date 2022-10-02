class Favourite extends Movies{

    constructor(){
        super();
        this.favouriteMovies = this.movies.filter((movie) => movie.favourite == true)
        this.favouriteMoviesList = document.querySelector("#favourite-movies-list");
    }

    loadFavouriteMovies(){
        
    }
}