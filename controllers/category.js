const bcrypt = require('bcrypt');
const Category = require("../models/category");
const decoded = require("../service/decoded");
const kirilLotin = require("../service/kirilLotin");


const all = async (req, res) => {
    // let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let title = req.query.title || null;
    let categories = [];
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
    // categories = await Category.find({...fil, userId:userFunction.id })
    //     .sort({_id:-1})
    //     .limit(quantity)
    //     .skip(next).lean();
    categories = await Category.find({...fil })
        .sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();
    if (categories.length > 0) {
        categories = categories.map(item => {
            item.createdTime = item.createdTime.toLocaleString("en-GB")
            return item
        })
    }
    // const count = await Category.find({...fil, userId:userFunction.id }).count()
    const count = await Category.find({...fil }).count()
    res.status(200).json({ categories, count });
}



const count = async (req, res) => {
    let userFunction = decoded(req,res)
    let categories = await Category.find({userId:userFunction.id})
        .count();
    res.status(200).json(categories);
}

const allActive = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let category = await Category.find({ status:1 }).lean()
        res.status(200).json(category);
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
            let category = await Category.findOne({_id}).lean()
            if(req.query.status) {
                category.status = parseInt(status)
            } else {
                category.status = category.status == 0 ? 1 : 0
            }
            let upstatus = await Category.findByIdAndUpdate(_id,category)
            let saveCategory = await Category.findOne({_id:_id}).lean()
            saveCategory.createdTime = saveCategory.createdTime.toLocaleString("en-GB")
            res.status(200).send(saveCategory)
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
        const category = await new Category({ userId:userFunction.id, title, createdTime:Date.now() });
        await category.save();
        let newCategory = await Category.findOne({_id:category._id}).lean()
        newCategory.createdTime = newCategory.createdTime.toLocaleString("en-GB")
        return res.status(201).json(newCategory);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const test = async (req, res) => {
    try {
        console.log("body",req.body)
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
            let category = await Category.findOneAndUpdate({_id:id},{ title, updateTime:Date.now()}, {returnDocument: 'after'});
            let saveCategory = await Category.findOne({_id:category._id}).lean();
            saveCategory.createdTime = saveCategory.createdTime.toLocaleString("en-GB")
            res.status(200).json(saveCategory);
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
        let category = await Category.findOne({_id}).lean();
        res.status(200).json(category);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let category = await Category.findByIdAndDelete(_id);
        res.status(200).json({message:'Удалено!', data: category._id});
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all, count, test, allActive, changeStatus, create, update, findOne, del }