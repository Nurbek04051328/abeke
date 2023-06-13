const bcrypt = require('bcrypt');
const Factory = require("../models/factory");
const User = require("../models/user");
const decoded = require("../service/decoded");
const kirilLotin = require("../service/kirilLotin");


const all = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let quantity = req.query.quantity || 20;
        let next = req.query.next || 1;
        next = (next-1)*quantity;
        // console.log("query", req.query)
        let name = req.query.name || null;
        let phone = req.query.phone || null;
        // console.log(phone)
        let factors = [];
        let fil = {};
        let othername = kirilLotin.kirlot(name)
        if (name) {
            fil = {
                ...fil, $or: [
                    {'name': {$regex: new RegExp(name.toLowerCase(), 'i')}},
                    {'name': {$regex: new RegExp(othername.toLowerCase(), 'i')}},
                ]
            }
        }
        if (phone) fil = {...fil, phone};
        factors = await Factory.find({...fil, userId:userFunction.id })
            .populate('user')
            .sort({_id:-1})
            .limit(quantity)
            .skip(next).lean();
        factors = factors.map(item => {
            item.createdAt = item.createdAt.toLocaleString("en-GB")
            return item
        })
        const count = await Factory.find({...fil, userId:userFunction.id }).count()
        res.status(200).json({ factors, count });
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}


const count = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        // let quantity = req.query.quantity || 30;
        // let next = req.query.next || 1;
        // next = (next-1)*quantity;
        let name = req.query.name || null;
        let factors = [];
        let fil = {};
        if (name) fil = {...fil, 'name': { $regex: new RegExp( name.toLowerCase(), 'i')}};
        factors = await Factory.find({...fil, userId:userFunction.id})
            .populate('user')
            .sort({_id:-1})
            .count();
        res.status(200).json(factors);
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
            let factory = await Factory.findOne({_id}).lean()
            if(req.query.status) {
                factory.status = parseInt(status)
            } else {
                factory.status = factory.status == 0 ? 1 : 0
            }
            let upstatus = await Factory.findByIdAndUpdate(_id,factory)
            let saveFactory = await Factory.findOne({_id:_id}).populate('user').lean()
            saveFactory.createdAt = saveFactory.createdAt.toLocaleString("en-GB")
            res.status(200).send(saveFactory)
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
        let { login, password, name, phone, address, status } = req.body;
        status = status || 1
        const haveLogin = await User.findOne({login});
        if (haveLogin) {
            return res.status(400).json({message: `Такой логин есть`});
        }
        let userFunction = decoded(req,res)
        const hashPass = await bcrypt.hash(password, 10);
        let newUser = await new User({ login, password:hashPass, role:'factor' });
        await newUser.save();

        const factory = await new Factory({ user:newUser._id, userId:userFunction.id, name, phone, address, createdAt:Date.now() });
        await factory.save();
        let newFactor = await Factory.findOne({_id:factory._id}).populate('user').lean()
        newFactor.createdAt = newFactor.createdAt.toLocaleString("en-GB")
        return res.status(201).json(newFactor);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const update = async (req, res) => {
    try {
        if (req.params.id) {
            let id = req.params.id;
            let { login, password, name, phone, address } = req.body;
            let factory = await Factory.findOneAndUpdate({_id:id},{ name, phone, address,  updateAt:Date.now()}, {returnDocument: 'after'});
            let userId = factory.user._id;
            let user = await User.findOne({_id: userId});
            user.login = login;
            if(password) {
                const hashPass = await bcrypt.hash(password, 10);
                user.password = hashPass;
            }
            await User.findByIdAndUpdate(user._id,user);
            let saveFactory = await Factory.findOne({_id:factory._id}).populate('user').lean();
            saveFactory.createdAt = saveFactory.createdAt.toLocaleString("en-GB")
            res.status(200).json(saveFactory);
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
        let factory = await Factory.findOne({_id}).populate('user').lean();
        res.status(200).json(factory);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let factory = await Factory.findByIdAndDelete(_id);
        await User.findByIdAndDelete({_id:factory.user});
        res.status(200).json({message:'Удалено!', data: factory._id});
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all, count, changeStatus, create, update, findOne, del }