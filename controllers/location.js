const Location = require("../models/location");
const decoded = require("../service/decoded");
const kirilLotin = require("../service/kirilLotin");


const all = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let subrealisator = req.query.subrealisator || null;
    let locations = [];
    let fil = {};
    if (subrealisator) fil = {...fil, subrealisator};
    locations = await Location.find({...fil, userId:userFunction.id })
        .populate('subrealisator')
        .sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();
    if (locations.length > 0) {
        locations = locations.map(item => {
            item.createdTime = item.createdTime.toLocaleString("en-GB")
            return item
        })
    }
    res.status(200).json(locations);
}



const last = async (req, res) => {
    let userFunction = decoded(req,res)
    let subId = req.params.id

    let location = await Location.findOne({ subrealisator:subId})
        .sort({createdTime:-1}).lean()
    if(location) {
        console.log("last",location)
        res.status(200).json(location);
    } else {
        res.status(400).json({message: "Hozircha locatsiyasi yuq"});
    }

}


const create = async (req, res) => {
    try {

        let { subrealisator, lat, long } = req.body;
        let userFunction = decoded(req,res)
        const location = await new Location({ userId:userFunction.id, subrealisator, lat, long, createdTime:Date.now() });
        await location.save();
        console.log(location , "data")
        let newLocation = await Location.findOne({_id:location._id}).populate('subrealisator').lean()
        newLocation.createdTime = newLocation.createdTime.toLocaleString("en-GB")
        console.log("new", newLocation)
        return res.status(201).json(newLocation);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}


const findOne = async (req, res) => {
    try {
        const _id = req.params.id;
        let location = await Location.findOne({_id}).populate('subrealisator').lean();
        res.status(200).json(location);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let location = await Location.findByIdAndDelete(_id);
        res.status(200).json({message:'Удалено!', data: location._id});
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all, create, findOne, del, last }