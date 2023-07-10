const {Schema, model} = require("mongoose");

const User = new Schema({
    login: {
        type: String, 
        required: [true, "Заполните логин"],
        unique: true
    },
    password: {
        type: String, 
        required: [true, "Заполните парол"]
    },
    role:{
        type:String
    },
    loginAt: [Date],
    createdAt: Date,
    updateAt:Date,
    status: {
        type: Number,
        default: 1
    }
})

module.exports = model("User", User)