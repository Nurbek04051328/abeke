const bcrypt = require('bcrypt');
const Typeproduct = require("../models/typeproduct");
const decoded = require("../service/decoded");
const kirilLotin = require("../service/kirilLotin");


const all = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 30;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let typeprice = req.query.typeprice || null;
    let category = req.query.category || null;
    let product = req.query.product || null;
    let typeproducts = [];
    let fil = {};
    if (typeprice) fil = {...fil, typeprice};
    if (category) fil = {...fil, category};
    if (product) fil = {...fil, product};
    typeproducts = await Typeproduct.find({...fil, userId:userFunction.id })
        .populate(['product', 'category', 'typeprice'])
        .sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();
    if (typeproducts.length > 0) {
        typeproducts = typeproducts.map(item => {
            item.createdTime = item.createdTime.toLocaleString("en-GB")
            return item
        })
    }
    const count = await Typeproduct.find({...fil, userId:userFunction.id }).count()
    res.status(200).json({ typeproducts, count });
}


const count = async (req, res) => {
    let userFunction = decoded(req,res)
    let typeproducts = await Typeproduct.find({userId:userFunction.id})
        .count();
    res.status(200).json(typeproducts);
}


const changeStatus = async (req, res) => {
    try {
        if (req.params.id) {
            const _id = req.params.id
            let status = req.query.status;
            let typeproduct = await Typeproduct.findOne({_id}).lean()
            if(req.query.status) {
                typeproduct.status = parseInt(status)
            } else {
                typeproduct.status = typeproduct.status == 0 ? 1 : 0
            }
            let upstatus = await Typeproduct.findByIdAndUpdate(_id,typeproduct)
            let saveTypeproduct = await Typeproduct.findOne({_id:_id}).populate(['product', 'category', 'typeprice']).lean()
            saveTypeproduct.createdTime = saveTypeproduct.createdTime.toLocaleString("en-GB")
            res.status(200).send(saveTypeproduct)
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
        let { typeprice, products } = req.body;
        let userFunction = decoded(req,res)
        let typeproducts = await Promise.all(products.map(async item => {
            if (item.category && item.product && item.price) {
                let status = 1
                let typeproduct = await new Typeproduct({ userId:userFunction.id, typeprice, product:item.product, category:item.category, price:item.price, status, createdTime:Date.now() });
                await typeproduct.save();
                return typeproduct
            }
        }))
        let newTypeproducts = await Typeproduct.find({userId:userFunction.id}).populate(['product', 'category', 'typeprice']).sort({_id:-1})
            .limit(products.length).lean()
        if (newTypeproducts.length > 0) {
            newTypeproducts = newTypeproducts.map(item => {
                item.createdTime = item.createdTime.toLocaleString("en-GB")
                return item
            })
        }
        console.log("typeproducts", newTypeproducts)
        return res.status(201).json(newTypeproducts);
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
        let typeproduct = await Typeproduct.findOne({_id}).lean();
        res.status(200).json(typeproduct);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let typeproduct = await Typeproduct.findByIdAndDelete(_id);
        res.status(200).json({message:'Удалено!', data: typeproduct._id});
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all, count, changeStatus, create, update, findOne, del }