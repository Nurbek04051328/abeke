const {Schema, model} = require("mongoose");


const Region = new Schema({
    userId:String,
    title: String,
    code:Number,
    createdTime:Date,
    updateTime:Date,
    status: {
        type: Number,
        default:1
    },
})

module.exports = model("Region", Region)    