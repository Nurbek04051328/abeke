const bcrypt = require('bcrypt');
const Unit = require("../models/unit");
const decoded = require("../service/decoded");
const kirilLotin = require("../service/kirilLotin");


const all = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let title = req.query.title || null;
    let units = [];
    let fil = {};
    let othername = kirilLotin.kirlot(title)
    if (title) {
        fil = {
            ...fil, $or: [
                {'title': {$regex: new RegExp(title.toLowerCase(), 'i')}},
                {'title': {$regex: new RegExp(othername.toLowerCase(), 'i')}},
            ]
        }
    }
    units = await Unit.find({...fil, userId:userFunction.id })
        .sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();
    if (units.length > 0) {
        units = units.map(item => {
            item.createdTime = item.createdTime.toLocaleString("en-GB")
            return item
        })
    }
    const count = await Unit.find({...fil, userId:userFunction.id }).count()
    res.status(200).json({ units, count });
}



const count = async (req, res) => {
    let userFunction = decoded(req,res)
    let units = await Unit.find({userId:userFunction.id})
        .count();
    res.status(200).json(units);
}

const allActive = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let units = await Unit.find({ status:1 }).lean()
        res.status(200).json(units);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const changeStatus = async (req, res) => {
    try {
        if (req.params.id) {
            const _id = req.params.id
            let status = req.query.status;
            let unit = await Unit.findOne({_id}).lean()
            if(req.query.status) {
                unit.status = parseInt(status)
            } else {
                unit.status = unit.status == 0 ? 1 : 0
            }
            let upstatus = await Unit.findByIdAndUpdate(_id,unit)
            let saveUnit = await Unit.findOne({_id:_id}).lean()
            saveUnit.createdTime = saveUnit.createdTime.toLocaleString("en-GB")
            res.status(200).send(saveUnit)
        } else {
            res.ststus(400).send({message: "Id не найдено"})
        }
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const create = async (req, res) => {
    try {
        let { title } = req.body;
        let userFunction = decoded(req,res)
        const unit = await new Unit({ userId:userFunction.id, title, createdTime:Date.now() });
        await unit.save();
        let newUnit = await Unit.findOne({_id:unit._id}).lean()
        newUnit.createdTime = newUnit.createdTime.toLocaleString("en-GB")
        return res.status(201).json(newUnit);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const update = async (req, res) => {
    try {
        if (req.params.id) {
            let id = req.params.id;
            let { title } = req.body;
            let unit = await Unit.findOneAndUpdate({_id:id},{ title, updateTime:Date.now()}, {returnDocument: 'after'});
            let saveUnit = await Unit.findOne({_id:unit._id}).lean();
            saveUnit.createdTime = saveUnit.createdTime.toLocaleString("en-GB")
            res.status(200).json(saveUnit);
        } else {
            res.status(500).json({message: "Не найдено id"});
        }
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}

const findOne = async (req, res) => {
    try {
        const _id = req.params.id;
        let unit = await Unit.findOne({_id}).lean();
        res.status(200).json(unit);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let unit = await Unit.findByIdAndDelete(_id);
        res.status(200).json({message:'Удалено!', data: unit._id});
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all, count, allActive, changeStatus, create, update, findOne, del }