let mongoose = require('mongoose');

let productsSchema = new mongoose.Schema({
    Type:{
        type: String,
        require: true
    },
    Name:{
        type: String,
        require: true
    },
    Price:{
        type: String,
        require: true
    },
    Img:{
        type: String,
        require: true
    },

})

module.exports = productsSchema;