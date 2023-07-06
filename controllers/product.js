const bcrypt = require('bcrypt');
const Product = require("../models/product");
const Typeprice = require("../models/typeprice");
const Typeproduct = require("../models/typeproduct");
const User = require("../models/user");
const Realisator = require("../models/realisator");
const decoded = require("../service/decoded");
const kirilLotin = require("../service/kirilLotin");
const fs = require('fs')


const all = async (req, res) => {
    let userFunction = decoded(req,res)
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
    products = await Product.find({...fil, userId:userFunction.id })
        .populate(['category', 'unit'])
        .sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();
    if (products.length > 0) {
        products = products.map(item => {
            item.createdTime = item.createdTime.toLocaleString("en-GB")
            return item
        })
    }
    const count = await Product.find({...fil, userId:userFunction.id }).count()
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
        let category = req.query.category || null;
        let products = [];
        let fill = {};
        if (category) fill = {...fill, category};
        products = await Product.find({...fill, userId:userFunction.id, status:1 }).lean()
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
            let saveProduct = await Product.findOne({_id:_id}).populate(['category', 'unit']).lean()
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
        let { code, title, category, unit, weight, price, count, photo } = req.body;
        // photo = photo[0].response
        let userFunction = decoded(req,res)
        const product = await new Product({ userId:userFunction.id, code, title, category, unit, weight, price, count, photo, createdTime:Date.now() });
        await product.save();
        let newProduct = await Product.findOne({_id:product._id}).populate(['category', 'unit']).lean()
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
            let saveProduct = await Product.findOne({_id:product._id}).populate(['category', 'unit']).lean();
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
        let file = req.files.file
        uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        filepath = `images/${uniquePreffix}_${file.name}`
        await file.mv(filepath)
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


//  Products for Realisator

const findRealis = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let user = await User.findOne({_id: userFunction.id}).lean();
        if (user.role == "realisator") {
            let realis = await Realisator.findOne({user: userFunction.id}).lean();
            let typeprices = await Typeprice.aggregate([
                {
                    $lookup: {
                        from: "realisators",
                        localField: "realisators",
                        foreignField: "_id",
                        as: "realisators",
                    },
                },
                {
                    $match:{
                        "realisators._id":realis._id
                    }
                },

            ])
            let result = await Promise.all(typeprices.map(async typeprice => {
                let obj = {}
                obj.title = typeprice.title
                obj.products = await Typeproduct.find({typeprice: typeprice._id}).populate(['product', 'category', {
                    path: 'product',
                    populate: {
                        path: 'unit',
                        model: 'Unit'
                    }
                }]).lean();
                let son = 0
                son = await Typeproduct.find({typeprice: typeprice._id}).count()
                obj.count =+ son

                return typeprice.obj = obj

            }))
            res.status(200).send(result)

        }
        if (user.role == "client") {
            let client = await Client.findOne({user: userFunction.id}).lean();
            let typeprices = await Typeprice.aggregate([
                {
                    $lookup: {
                        from: "clients",
                        localField: "clients",
                        foreignField: "_id",
                        as: "clients",
                    },
                },
                {
                    $match:{
                        "clients._id":client._id
                    }
                },

            ]);

            let result = await Promise.all(typeprices.map(async typeprice => {
                let obj = {}
                obj.title = typeprice.title
                obj.products = await Typeproduct.find({typeprice: typeprice._id}).populate(['product', 'category', {
                    path: 'product',
                    populate: {
                        path: 'unit',
                        model: 'Unit'
                    }
                }]).lean();
                return typeprice.obj = obj

            }))
            console.log("res", result)
            res.status(200).send(result)

        }
        // let typeprices = await Typeprice.find({}).lean();
        // res.status(200).json(product);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}


const forTypeprice = async (req, res) => {
    try {
        let userFunction = decoded(req,res);
        let category = req.query.category || null;
        let fil = {};
        let result = []
        if (category) fil = {...fil, category};
        let user = await User.findOne({_id: userFunction.id}).lean();
        if (user.role == "realisator") {
            let realis = await Realisator.findOne({user: userFunction.id}).lean();
            let typeprices = await Typeprice.aggregate([
                {
                    $lookup: {
                        from: "realisators",
                        localField: "realisators",
                        foreignField: "_id",
                        as: "realisators",
                    },
                },
                {
                    $match:{
                        "realisators._id":realis._id
                    }
                },

            ])

            let result = await Promise.all(typeprices.map(async typeprice => {
                let obj = {}
                obj.title = typeprice.title
                obj.products = await Typeproduct.find({...fil, typeprice: typeprice._id}).populate(['product', 'category', {
                    path: 'product',
                    populate: {
                        path: 'unit',
                        model: 'Unit'
                    }
                }]).lean();
                let son = 0
                son = await Typeproduct.find({typeprice: typeprice._id}).count()
                obj.count =+ son

                return typeprice.obj = obj

            }))
            res.status(200).send(result)

        }
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}





module.exports = { all, count, changeStatus, allActive, create, update, findOne, del, createPhoto, deleteImg, findRealis }









// let typeprices = await Typeprice.find({type:1}).elemMatch("realisators", { realisator: realis._id }).lean();
// console.log("typeprices", typeprices)