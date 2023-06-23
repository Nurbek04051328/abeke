const {Schema, model} = require('mongoose')

const order = new Schema({
    userId: String,
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'

    },
    // category: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Category'
    //
    // },
    count: Number,
    realisator:
        {
            type: Schema.Types.ObjectId,
            ref: 'Realisator'

        },
    subrealisator:
        {
            type: Schema.Types.ObjectId,
            ref: 'Subrealisator'

        },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client'
    },
    createdTime: Date,
    updateTime: Date,
    status: {
        type: Number,
        default: 1
    }
})

// type = 1 realisators
// type = 2 clients


module.exports = model('Order',order)