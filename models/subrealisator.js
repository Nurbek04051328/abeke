const {Schema, model} = require('mongoose')

const subrealisator = new Schema({
    userId: String,
    user: {
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    name: {
        type:String,
        required: true,
        default: 'Нет названия'
    },
    phone: {
        type: String,
        required: true
    },
    summa: {
        type: Number,
    },
    createdAt: Date,
    updateAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Subrealisator',subrealisator)

// province
    //1-Almazar rayon
    //2-Bektemir rayon