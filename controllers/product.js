const bcrypt = require('bcrypt');
const Product = require("../models/product");
const decoded = require("../service/decoded");
const kirilLotin = require("../service/kirilLotin");
const fs = require('fs')


const all = async (req, res) => {
    // let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let title = req.query.title || null;
    let code = req.query.code || null;
    let category = req.query.category || null;
    let products = [];
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
    if (code) fil = {...fil, code};
    if (category) fil = {...fil, category};
    // products = await Product.find({...fil, userId:userFunction.id })
    //     .sort({_id:-1})
    //     .limit(quantity)
    //     .skip(next).lean();
    products = await Product.find({...fil, })
        .populate('category')
        .sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();
    if (products.length > 0) {
        products = products.map(item => {
            item.createdTime = item.createdTime.toLocaleString("en-GB")
            return item
        })
    }
    // const count = await Product.find({...fil, userId:userFunction.id }).count()
    const count = await Product.find({...fil, }).count()
    res.status(200).json({ products, count });
}


const count = async (req, res) => {
    let userFunction = decoded(req,res)
    let products = await Product.find({userId:userFunction.id})
        .count();
    res.status(200).json(products);
}

const allActive = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let products = await Product.find({ status:1 }).lean()
        res.status(200).json(products);
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
            let product = await Product.findOne({_id}).lean()
            if(req.query.status) {
                product.status = parseInt(status)
            } else {
                product.status = product.status == 0 ? 1 : 0
            }
            let upstatus = await Product.findByIdAndUpdate(_id,product)
            let saveProduct = await Product.findOne({_id:_id}).populate('category').lean()
            saveProduct.createdTime = saveProduct.createdTime.toLocaleString("en-GB")
            res.status(200).send(saveProduct)
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
        console.log("body", req.body)
        let { code, title, category, unit, weight, price, count, photo } = req.body;
        // photo = photo[0].response
        // let userFunction = decoded(req,res)
        // const product = await new Product({ userId:userFunction.id, code, title, category, unit, weight, price, count, photo, createdTime:Date.now() });
        const product = await new Product({ code, title, category, unit, weight, price, count, photo, createdTime:Date.now() });
        await product.save();
        let newProduct = await Product.findOne({_id:product._id}).populate('category').lean()
        newProduct.createdTime = newProduct.createdTime.toLocaleString("en-GB")
        return res.status(201).json(newProduct);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const update = async (req, res) => {
    try {
        if (req.params.id) {
            let id = req.params.id;
            let { code, title, category, unit, weight, price, count, photo } = req.body;
            let product = await Product.findOneAndUpdate({_id:id},{ code, title, category, unit, weight, price, count, photo, updateTime:Date.now()}, {returnDocument: 'after'});
            let saveProduct = await Product.findOne({_id:product._id}).populate('category').lean();
            saveProduct.createdTime = saveProduct.createdTime.toLocaleString("en-GB")
            res.status(200).json(saveProduct);
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
        let product = await Product.findOne({_id}).lean();
        res.status(200).json(product);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let product = await Product.findByIdAndDelete(_id);
        if (fs.existsSync(product.photo)) {
            fs.unlinkSync(product.photo)
        }
        res.status(200).json({message:'Удалено!', data: product._id});
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


// upload Img

const createPhoto = async  (req,res) =>{
    if (req.files) {
        console.log("reqfiles", req.files)
        let file = req.files.file
        uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        filepath = `images/${uniquePreffix}_${file.name}`
        await file.mv(filepath)
        console.log(filepath)
        res.status(200).send(filepath)
    }

}

// delete Img
const deleteImg = async (req,res)=>{

    let delFiles = req.body.file
    if (fs.existsSync(delFiles)) {
        fs.unlinkSync(delFiles)
    }
    res.status(200).send({message: "Успешно"})
}

module.exports = { all, count, changeStatus, allActive, create, update, findOne, del, createPhoto, deleteImg }