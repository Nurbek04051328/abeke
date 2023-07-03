const bcrypt = require('bcrypt');
const Typeprice = require("../models/typeprice");
const decoded = require("../service/decoded");
const kirilLotin = require("../service/kirilLotin");


const all = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let title = req.query.title || null;
    let type = req.query.type || null;
    let typeprices = [];
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
    if (type) fil = {...fil, type};
    typeprices = await Typeprice.find({...fil, userId:userFunction.id })
        .populate(['realisators', 'clients'])
        .sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();
    if (typeprices.length > 0) {
        typeprices = typeprices.map(item => {
            item.type = item.type == 1 ? 'Реализатор' : 'Клиент'
            item.createdTime = item.createdTime.toLocaleString("en-GB")
            return item
        })
    }
    const count = await Typeprice.find({...fil, userId:userFunction.id }).count()
    res.status(200).json({ typeprices, count });
}


const count = async (req, res) => {
    let userFunction = decoded(req,res)
    let typeprices = await Typeprice.find({userId:userFunction.id})
        .count();
    res.status(200).json(typeprices);
}


const changeStatus = async (req, res) => {
    try {
        if (req.params.id) {
            const _id = req.params.id
            let status = req.query.status;
            let typeprice = await Typeprice.findOne({_id}).lean()
            if(req.query.status) {
                typeprice.status = parseInt(status)
            } else {
                typeprice.status = typeprice.status == 0 ? 1 : 0
            }
            let upstatus = await Typeprice.findByIdAndUpdate(_id,typeprice)
            let saveTypeprice = await Typeprice.findOne({_id:_id}).lean()
            saveTypeprice.createdTime = saveTypeprice.createdTime.toLocaleString("en-GB")
            saveTypeprice.type = saveTypeprice.type == 1 ? 'Реализатор' : 'Клиент'
            res.status(200).send(saveTypeprice)
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
        let { title, type, realisators, clients } = req.body;
        // console.log("body", req.body)
        let userFunction = decoded(req,res)
        const typeprice = await new Typeprice({ userId:userFunction.id, title, type, realisators, clients, createdTime:Date.now() });
        await typeprice.save();
        let newTypeprice = await Typeprice.findOne({_id:typeprice._id}).lean()
        newTypeprice.createdTime = newTypeprice.createdTime.toLocaleString("en-GB")
        newTypeprice.type = newTypeprice.type == 1 ? 'Реализатор' : 'Клиент'
        return res.status(201).json(newTypeprice);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const update = async (req, res) => {
    try {
        if (req.params.id) {
            let id = req.params.id;
            let { title, type, realisators, clients } = req.body;
            let typeprice = await Typeprice.findOneAndUpdate({_id:id},{ title, type, realisators, clients, updateTime:Date.now()}, {returnDocument: 'after'});
            let saveTypeprice = await Typeprice.findOne({_id:typeprice._id}).lean();
            saveTypeprice.createdTime = saveTypeprice.createdTime.toLocaleString("en-GB")
            saveTypeprice.type = saveTypeprice.type == 1 ? 'Реализатор' : 'Клиент'
            res.status(200).json(saveTypeprice);
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
        let typeprice = await Typeprice.findOne({_id}).populate(['realisators', 'clients']).lean();
        res.status(200).json(typeprice);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let typeprice = await Typeprice.findByIdAndDelete(_id);
        res.status(200).json({message:'Удалено!', data: typeprice._id});
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all, count, changeStatus, create, update, findOne, del }