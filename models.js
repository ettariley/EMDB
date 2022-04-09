const mongoose = require('mongoose'),
    bcrypt = require('bcrypt');

// Define movie schema
let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String,
        Birth: Date
    },      
    ReleaseYear: Date,
    Actors: [String],
    ImageURL: String,
    Featured: Boolean
});

// Define user schema
let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

// Hash password on creation
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

//Validate hashed password on login
userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
};

// Define schemas as model variables
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

// Exports models
module.exports.Movie = Movie;
module.exports.User = User;