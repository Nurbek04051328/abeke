const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config()


// Routers
const routerList = require('./router.js')

const app = express()
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use(cors());
app.use(routerList);





const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        app.listen(PORT, () => {
            console.log(`Server ${PORT} da ishladi`);
        })
    } catch (error) {
        console.log(error);
    }
};

start()