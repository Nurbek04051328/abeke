const {Schema, model} = require("mongoose");


const City = new Schema({
    userId:String,
    title: String,
    region: {
        type: Schema.Types.ObjectId,
        ref:'Region'
    },
    createdTime:Date,
    updateTime:Date,
    status: {
        type: Number,
        default:1
    },
})

module.exports = model("City", City)    