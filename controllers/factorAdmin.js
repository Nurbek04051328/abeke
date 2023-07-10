const bcrypt = require('bcrypt');
const FactorAdmin = require("../models/factorAdmin");
const User = require("../models/user");
const mongoose = require("mongoose")


const all = async (req, res) => {
    try {
        let quantity = req.query.quantity || 20;
        let next = req.query.next || 1;
        next = (next-1)*quantity;
        let name = req.query.name || null;
        let adminFactors = [];
        let fil = {};
        if (name) fil = {...fil, 'name': { $regex: new RegExp( name.toLowerCase(), 'i')}};
        adminFactors = await FactorAdmin.find({...fil})
            .populate('user')
            .sort({_id:-1})
            .limit(quantity)
            .skip(next).lean();
        adminFactors = adminFactors.map(item => {
            item.createdAt = item.createdAt.toLocaleString("en-GB")
            return item
        })
        res.status(200).json(adminFactors);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const count = async (req, res) => {
    try {
        // let quantity = req.query.quantity || 30;
        // let next = req.query.next || 1;
        // next = (next-1)*quantity;
        let name = req.query.name || null;
        let adminFactors = [];
        let fil = {};
        if (name) fil = {...fil, 'name': { $regex: new RegExp( name.toLowerCase(), 'i')}};
        adminFactors = await FactorAdmin.find({...fil})
            .populate('user')
            .sort({_id:-1})
            .count();
        res.status(200).json(adminFactors);
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
            let factoryAdmin = await FactorAdmin.findOne({_id}).lean()
            let user = await User.findOne({_id: factoryAdmin.user}).lean()
            if(req.query.status) {
                factoryAdmin.status = parseInt(status)
                user.status = parseInt(status)
            } else {
                factoryAdmin.status = factoryAdmin.status == 0 ? 1 : 0
                user.status = user.status == 0 ? 1 : 0
            }
            let upstatus = await FactorAdmin.findByIdAndUpdate(_id,factoryAdmin)
            let us = await User.findByIdAndUpdate({_id: user._id}, user,  {returnDocument: 'after'});
            let saveFactoryAdmin = await FactorAdmin.findOne({_id:_id}).populate('user').lean()
            saveFactoryAdmin.createdAt = saveFactoryAdmin.createdAt.toLocaleString("en-GB")
            res.status(200).send(saveFactoryAdmin)
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
        let { login, password, name, phone, email, status } = req.body;
        status = status || 1
        const haveLogin = await User.findOne({login});
        console.log(haveLogin)
        if (haveLogin) {
            return res.status(400).json({message: `Такой логин есть`});
        }
        const hashPass = await bcrypt.hash(password, 10);
        let newUser =  new User({ login, password:hashPass, role:'admin' });
        await newUser.validate();
        await newUser.save();
        const factorAdmin = await new FactorAdmin({ user:newUser._id, name, phone, email, status, createdAt:Date.now() });
        await factorAdmin.validate();
        await factorAdmin.save();
        let newFactoryAdmin = await FactorAdmin.findOne({_id:factorAdmin._id}).populate('user').lean()
        newFactoryAdmin.createdAt = newFactoryAdmin.createdAt.toLocaleString("en-GB")
        return res.status(201).json(newFactoryAdmin);
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            const errors = {};
            for (let key in error.errors) {
                errors[key] = error.errors[key].message;
            }
            res.status(400).send(errors);
        } else {
            res.status(500).send(error);
        }
    }
}

const update = async (req, res) => {
    try {
        if (req.params.id) {
            let id = req.params.id;
            let { login, password, name, phone, email } = req.body;
            let factorAdmin = await FactorAdmin.findOneAndUpdate({_id:id},{ name, phone, email, updateAt:Date.now()}, {returnDocument: 'after'});
            let userId = factorAdmin.user._id;
            let user = await User.findOne({_id: userId});
            user.login = login;
            if(password) {
                const hashPass = await bcrypt.hash(password, 10);
                user.password = hashPass;
            }
            await User.findByIdAndUpdate(user._id,user);
            let saveFactorAdmin = await FactorAdmin.findOne({_id:factorAdmin._id}).populate('user').lean();
            saveFactorAdmin.createdAt = saveFactorAdmin.createdAt.toLocaleString("en-GB")
            res.status(200).json(saveFactorAdmin);
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
        let factorAdmin = await FactorAdmin.findOne({_id}).populate('user').lean();
        res.status(200).json(factorAdmin);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id
        console.log(_id)
        let factorAdmin = await FactorAdmin.findByIdAndDelete(_id);
        await User.findByIdAndDelete({_id:factorAdmin.user});
        res.status(200).json({message:'Удалено!', data: factorAdmin._id});
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all, count, changeStatus, create, update, findOne, del }