const bcrypt = require('bcrypt');
const Worker = require("../models/worker");
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
        let workers = [];
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
        workers = await Worker.find({...fil, userId:userFunction.id })
            .populate('user')
            .sort({_id:-1})
            .limit(quantity)
            .skip(next).lean();
        workers = workers.map(item => {
            item.createdAt = item.createdAt.toLocaleString("en-GB")
            return item
        })
        const count = await Worker.find({...fil, userId:userFunction.id }).count()
        res.status(200).json({ workers, count });
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}


const count = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let workers = await Worker.find({userId:userFunction.id}).count();
        res.status(200).json(workers);
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
            let worker = await Worker.findOne({_id}).lean()
            if(req.query.status) {
                worker.status = parseInt(status)
            } else {
                worker.status = worker.status == 0 ? 1 : 0
            }
            let upstatus = await Worker.findByIdAndUpdate(_id,worker)
            let saveWorker = await Worker.findOne({_id:_id}).populate('user').lean()
            saveWorker.createdAt = saveWorker.createdAt.toLocaleString("en-GB")
            res.status(200).send(saveWorker)
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
        let { login, password, name, lname, phone, spec, status } = req.body;
        status = status || 1
        const haveLogin = await User.findOne({login});
        if (haveLogin) {
            return res.status(400).json({message: `Такой логин есть`});
        }
        let userFunction = decoded(req,res)
        const hashPass = await bcrypt.hash(password, 10);
        let newUser = await new User({ login, password:hashPass, role:'factor' });
        await newUser.save();

        const worker = await new Worker({ user:newUser._id, userId:userFunction.id, name, phone, address, createdAt:Date.now() });
        await worker.save();
        let newWorker = await Worker.findOne({_id:worker._id}).populate('user').lean()
        newWorker.createdAt = newWorker.createdAt.toLocaleString("en-GB")
        return res.status(201).json(newWorker);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const update = async (req, res) => {
    try {
        if (req.params.id) {
            let id = req.params.id;
            let { login, password, name, lname, phone, spec, status } = req.body;
            let worker = await Worker.findOneAndUpdate({_id:id},{ name, lname, phone, spec, status  updateAt:Date.now()}, {returnDocument: 'after'});
            let userId = worker.user._id;
            let user = await User.findOne({_id: userId});
            user.login = login;
            if(password) {
                const hashPass = await bcrypt.hash(password, 10);
                user.password = hashPass;
            }
            await User.findByIdAndUpdate(user._id,user);
            let saveFWorker = await Worker.findOne({_id:worker._id}).populate('user').lean();
            saveWorker.createdAt = saveFWorker.createdAt.toLocaleString("en-GB")
            res.status(200).json(saveFWorker);
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
        let worker = await Worker.findOne({_id}).populate('user').lean();
        res.status(200).json(worker);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let worker = await Worker.findByIdAndDelete(_id);
        await User.findByIdAndDelete({_id:worker.user});
        res.status(200).json({message:'Удалено!', data: worker._id});
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all, count, changeStatus, create, update, findOne, del }