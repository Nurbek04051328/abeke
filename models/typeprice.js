const {Schema, model} = require('mongoose')

const typeprice = new Schema({
    userId: String,
    title: String,
    type: Number,
    realisators: [
        {
                type: Schema.Types.ObjectId,
                ref: 'Realisator',
                default:null

        }
    ],
    clients: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Client',
            default:null
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