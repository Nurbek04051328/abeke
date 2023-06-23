const {Schema, model} = require('mongoose')

const typeprice = new Schema({
    userId: String,
    title: String,
    type: Number,
    realisators: [
        {
                type: Schema.Types.ObjectId,
                ref: 'Realisator'

        }
    ],
    clients: [
        {
            client: {
                type: Schema.Types.ObjectId,
                ref: 'Client'
            }
        }
    ],
    createdTime: Date,
    updateTime: Date,
    status: {
        type: Number,
        default: 1
    }
})

// type = 1 realisators
// type = 2 clients


module.exports = model('Typeprice',typeprice)