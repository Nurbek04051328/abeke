const {Schema, model} = require('mongoose')

const factorAdmin = new Schema({
    user: {
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    name: {
        type: String,
        required: [true, "Заполните название"],
    },
    phone: {
        type: String,
        required: [true, "Заполните номер телефона"],
    },
    email: {
        type: String,
        
    },
    createdAt: Date,
    updateAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('FactorAdmin',factorAdmin)