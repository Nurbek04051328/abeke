const {Schema, model} = require('mongoose')

const factorAdmin = new Schema({
    user: {
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    name: {
        type: String,
        
    },
    phone: {
        type: String,
        
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