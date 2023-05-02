const {Schema, model} = require('mongoose')

const client = new Schema({
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
    subrealisator: {
        type: Schema.Types.ObjectId,
        ref: 'Subrealisator'
    },
    province: {
        type: Number,
    },
    inn: {
        type: String,
    },
    mfo: {
        type: String,
    },
    address: String,
    debt: Number,
    check: Number,,
    limit: Number,
    createdAt: Date,
    updateAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Client',client)

//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