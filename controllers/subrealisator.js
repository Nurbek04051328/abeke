const bcrypt = require('bcrypt');
const Subrealisator = require("../models/subrealisator");
const User = require("../models/user");
const decoded = require("../service/decoded");
const kirilLotin = require("../service/kirilLotin");


const all = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let quantity = req.query.quantity || 20;
        let next = req.query.next || 1;
        next = (next-1)*quantity;
        let name = req.query.name || null;
        let phone = req.query.phone || null;
        let subrealisators = [];
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
        subrealisators = await Subrealisator.find({...fil, userId:userFunction.id })
            .populate('user')
            .sort({status:-1})
            .limit(quantity)
            .skip(next).lean();
        subrealisators = subrealisators.map(item => {
            item.createdAt = item.createdAt.toLocaleString("en-GB")
            return item
        })
        const count = await Subrealisator.find({...fil, userId:userFunction.id }).count()
        res.status(200).json({ subrealisators, count });
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const allActive = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let subrealisator = await Subrealisator.find({ status:1 }).lean()
        // console.log("sub" subrealisator)
        res.status(200).json(subrealisator);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const count = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        subrealisators = await Subrealisator.find({userId:userFunction.id})
            .populate('user')
            .count();
        res.status(200).json(subrealisators);
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
            let subrealisator = await Subrealisator.findOne({_id}).lean()
            if(req.query.status) {
                subrealisator.status = parseInt(status)
            } else {
                subrealisator.status = subrealisator.status == 0 ? 1 : 0
            }
            let upstatus = await Subrealisator.findByIdAndUpdate(_id,subrealisator)
            let saveSubrealisator = await Subrealisator.findOne({_id:_id}).populate('user').lean()
            saveSubrealisator.createdAt = saveSubrealisator.createdAt.toLocaleString("en-GB")
            res.status(200).send(saveSubrealisator)
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
        let { login, password, name, phone, summa } = req.body;
        const haveLogin = await User.findOne({login});
        if (haveLogin) {
            return res.status(400).json({message: `Такой логин есть`});
        }
        let userFunction = decoded(req,res)
        const hashPass = await bcrypt.hash(password, 10);
        let newUser = await new User({ login, password:hashPass, role:'subrealisator' });
        await newUser.save();

        const subrealisator = await new Subrealisator({ user:newUser._id, userId:userFunction.id, name, phone, summa, createdAt:Date.now() });
        await subrealisator.save();
        let newSubrealisator = await Subrealisator.findOne({_id:subrealisator._id}).populate('user').lean()
        newSubrealisator.createdAt = newSubrealisator.createdAt.toLocaleString("en-GB")
        return res.status(201).json(newSubrealisator);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const update = async (req, res) => {
    try {
        if (req.params.id) {
            let id = req.params.id;
            let { login, password, name, phone, summa } = req.body;
            let subrealisator = await Subrealisator.findOneAndUpdate({_id:id},{ name, phone, summa, updateAt:Date.now()}, {returnDocument: 'after'});
            let userId = subrealisator.user._id;
            let user = await User.findOne({_id: userId});
            user.login = login;
            if(password) {
                const hashPass = await bcrypt.hash(password, 10);
                user.password = hashPass;
            }
            await User.findByIdAndUpdate(user._id,user);
            let saveSubrealisator = await Subrealisator.findOne({_id:subrealisator._id}).populate('user').lean();
            saveSubrealisator.createdAt = saveSubrealisator.createdAt.toLocaleString("en-GB")
            res.status(200).json(saveSubrealisator);
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
        let subrealisator = await Subrealisator.findOne({_id}).populate('user').lean();
        subrealisator.createdAt = subrealisator.createdAt.toLocaleString("en-GB")
        res.status(200).json(subrealisator);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let subrealisator = await Subrealisator.findByIdAndDelete(_id);
        await User.findByIdAndDelete({_id:subrealisator.user});
        res.status(200).json({message:'Удалено!', data: subrealisator._id});
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all, count, allActive, changeStatus, create, update, findOne, del }