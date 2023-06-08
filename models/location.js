const {Schema, model} = require('mongoose')

const location = new Schema({
    userId: String,
    subrealisator: {
        type:Schema.Types.ObjectId,
        ref:'Subrealisator'
    },
    lat:String,
    long:String,
    createdAt: Date,
    updateAt: Date,
})


module.exports = model('Location',location)