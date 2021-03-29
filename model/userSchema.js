let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    Name:{
        type: String,
        require: true
    },
    User:{
        type: String,
        require: true
    },
    Pass:{
        type: String,
        require: true
    },
    Phone:{
        type: String,
        require: true
    },
    Adress:{
        type: String,
        require: true
    }

})

module.exports = userSchema;