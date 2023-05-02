const {Schema, model} = require("mongoose");

const User = new Schema({
    login: {
        type: String, 
        required: true, 
        unique: true
    },
    password: {
        type: String, 
        required: true
    },
    name: String,
    role:{
        type:String
    },
    loginAt: [Date],
    createdAt: Date,
    updateAt:Date,
})

module.exports = model("User", User)