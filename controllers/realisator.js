const bcrypt = require('bcrypt');
const Realisator = require("../models/realisator");
const User = require("../models/user");
const decoded = require("../service/decoded");
const kirilLotin = require("../service/kirilLotin");


const all = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let quantity = req.query.quantity || 5;
        let next = req.query.next || 1;
        next = (next-1)*quantity;
        let name = req.query.name || null;
        let phone = req.query.phone || null;
        // console.log(phone)
        let realisators = [];
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
        realisators = await Realisator.find({...fil, userId:userFunction.id })
            .populate([
                {path:"user",model:User, select:'login role'}
            ])
            .sort({_id:-1})
            .limit(quantity)
            .skip(next).lean();
        realisators = realisators.map(item => {
            item.createdAt = item.createdAt.toLocaleString("en-GB")
            return item
        })
        const count = await Realisator.find({...fil, userId:userFunction.id }).count()
        res.status(200).json({ realisators, count });
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}


const count = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        realisators = await Realisator.find({userId:userFunction.id}).count();
        res.status(200).json(realisators);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const allActive = async (req, res) => {
    try {
        let realisator = await Realisator.find({ status:1 }).lean()
        res.status(200).json(realisator);
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
            let realisator = await Realisator.findOne({_id}).lean();
            let user = await User.findOne({_id: realisator.user}).lean()
            if(req.query.status) {
                realisator.status = parseInt(status);
                user.status = parseInt(status)
            } else {
                realisator.status = realisator.status == 0 ? 1 : 0;
                user.status = user.status == 0 ? 1 : 0
            }
            let upstatus = await Realisator.findByIdAndUpdate(_id,realisator)
            await User.findByIdAndUpdate({_id: user._id}, user,  {returnDocument: 'after'});
            let saveRealisator = await Realisator.findOne({_id:_id}).populate([
                {path:"user",model:User, select:'login role'}
            ]).lean()
            saveRealisator.createdAt = saveRealisator.createdAt.toLocaleString("en-GB")
            res.status(200).send(saveRealisator)
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
        let { login, password, name, phone } = req.body;
        const haveLogin = await User.findOne({login});
        if (haveLogin) {
            return res.status(400).json({message: `Такой логин есть`});
        }
        let userFunction = decoded(req,res)
        const hashPass = await bcrypt.hash(password, 10);
        let newUser = await new User({ login, password:hashPass, role:'realisator' });
        await newUser.save();

        const realisator = await new Realisator({ user:newUser._id, userId:userFunction.id, name, phone, createdAt:Date.now() });
        await realisator.save();
        let newRealisator = await Realisator.findOne({_id:realisator._id}).populate([
            {path:"user",model:User, select:'login role'}
        ]).lean()
        newRealisator.createdAt = newRealisator.createdAt.toLocaleString("en-GB")
        return res.status(201).json(newRealisator);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const update = async (req, res) => {
    try {
        if (req.params.id) {
            let id = req.params.id;
            let { login, password, name, phone } = req.body;
            let realisator = await Realisator.findOneAndUpdate({_id:id},{ name, phone, updateAt:Date.now()}, {returnDocument: 'after'});
            let userId = realisator.user._id;
            let user = await User.findOne({_id: userId});
            user.login = login;
            if(password) {
                const hashPass = await bcrypt.hash(password, 10);
                user.password = hashPass;
            }
            await User.findByIdAndUpdate(user._id,user);
            let saveRealisator = await Realisator.findOne({_id:realisator._id}).populate([
                {path:"user",model:User, select:'login role'}
            ]).lean();
            saveRealisator.createdAt = saveRealisator.createdAt.toLocaleString("en-GB")
            res.status(200).json(saveRealisator);
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
        let realisator = await Realisator.findOne({_id}).populate([
            {path:"user",model:User, select:'login role'}
        ]).lean();
        console.log("real",realisator)
        res.status(200).json(realisator);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let realisator = await Realisator.findByIdAndDelete(_id);
        await User.findByIdAndDelete({_id:realisator.user});
        res.status(200).json({message:'Удалено!', data: realisator._id});
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all, count, allActive, changeStatus, create, update, findOne, del }