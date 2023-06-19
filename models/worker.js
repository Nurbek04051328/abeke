const {Schema, model} = require('mongoose')
const worker = new Schema({
    user: {
        type:Schema.Types.ObjectId,
        ref:'User',
        default: null
    },
    loginType:Number,
    name: String,
    lname: String,
    phone: String,
    spec: String,
    createdTime: Date,
    updateTime: Date,
    status: {
        type: Number,
        default: 1
    }
})
module.exports = model('Worker',worker)