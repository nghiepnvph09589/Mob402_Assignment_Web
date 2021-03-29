let mongoose = require('mongoose');

let adminSchema = new mongoose.Schema({
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


})

module.exports = adminSchema;