const Product = require("../models/product");
const Order = require("../models/order");
const Client = require("../models/client");
const User = require("../models/user");
const Realisator = require("../models/realisator");
const decoded = require("../service/decoded");
const fs = require('fs')


const all = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let product = req.query.product || null;
    let realisator = req.query.realisator || null;
    let subrealisator = req.query.subrealisator || null;
    let client = req.query.client || null;
    // let category = req.query.category || null;
    let orders = [];
    let fil = {};
    if (product) fil = {...fil, product};
    if (realisator) fil = {...fil, realisator};
    if (subrealisator) fil = {...fil, subrealisator};
    if (client) fil = {...fil, client};
    // if (category) fil = {...fil, category};
    orders = await Order.find({...fil })
        .populate(['product', 'realisator', 'subrealisator', 'client'])
        .sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();
    if (orders.length > 0) {
        orders = orders.map(item => {
            item.createdTime = item.createdTime.toLocaleString("en-GB")
            return item
        })
    }
    const count = await Order.find({...fil }).count()
    res.status(200).json({ orders, count });
}


const count = async (req, res) => {
    let userFunction = decoded(req,res)
    let orders = await Order.find().count();
    res.status(200).json(orders);
}

const allActive = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        // let category = req.query.category || null;
        let product = req.query.product || null;
        let realisator = req.query.realisator || null;
        let subrealisator = req.query.subrealisator || null;
        let client = req.query.client || null;
        let orders = [];
        let fill = {};
        // if (category) fill = {...fill, category};
        if (product) fill = {...fill, product};
        if (realisator) fill = {...fill, realisator};
        if (subrealisator) fill = {...fill, subrealisator};
        if (client) fill = {...fill, client};

        orders = await Order.find({...fill, userId:userFunction.id, status:1 }).lean()
        res.status(200).json(orders);
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
            let order = await Order.findOne({_id}).lean()
            if(req.query.status) {
                order.status = parseInt(status)
            } else {
                order.status = order.status == 0 ? 1 : 0
            }
            let upstatus = await Order.findByIdAndUpdate(_id,order)
            let saveOrder = await Order.findOne({_id:_id}).populate(['product', 'realisator', 'subrealisator', 'client']).lean()
            saveOrder.createdTime = saveOrder.createdTime.toLocaleString("en-GB")
            res.status(200).send(saveOrder)
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
        let { product, count, realisator, subrealisator, client } = req.body;
        let userFunction = decoded(req,res)
        const order = await new Order({ userId:userFunction.id, product, count, realisator, subrealisator, client, createdTime:Date.now() });
        await order.save();
        let newOrder = await Order.findOne({_id:order._id}).populate(['product', 'realisator', 'subrealisator', 'client']).lean()
        newOrder.createdTime = newOrder.createdTime.toLocaleString("en-GB")
        return res.status(201).json(newOrder);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const update = async (req, res) => {
    try {
        if (req.params.id) {
            let id = req.params.id;
            let {product, count, realisator, subrealisator, client } = req.body;
            let order = await Order.findOneAndUpdate({_id:id},{ product, count, realisator, subrealisator, client, updateTime:Date.now()}, {returnDocument: 'after'});
            let saveOrder = await Order.findOne({_id:order._id}).populate(['product', 'realisator', 'subrealisator', 'client']).lean();
            saveOrder.createdTime = saveOrder.createdTime.toLocaleString("en-GB")
            res.status(200).json(saveOrder);
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
        let order = await Order.findOne({_id}).lean();
        res.status(200).json(order);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let order = await Order.findByIdAndDelete(_id);

        res.status(200).json({message:'Удалено!', data: order._id});
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}





module.exports = { all, count, changeStatus, allActive, create, update, findOne, del }