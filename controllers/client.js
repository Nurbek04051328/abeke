const bcrypt = require('bcrypt');
const Client = require("../models/client");
const User = require("../models/user");
const decoded = require("../service/decoded");
const kirilLotin = require("../service/kirilLotin");


const all = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let name = req.query.name || null;
    let phone = req.query.phone || null;
    let region = req.query.region || null;
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
    if (region) fil = {...fil, region};
    clients = await Client.find({...fil, userId:userFunction.id })
        .populate(['user', 'subrealisator', 'district'])
        .select(['_id', 'user', 'subrealisator', 'district', 'limit', 'debt', 'phone', 'name', 'address'])
        .sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();
    // clients = clients.map(item => {
    //     item.createdAt = item.createdAt.toLocaleString("en-GB")
    //     return item
    // })
    const count = await Client.find({...fil, userId:userFunction.id }).count()
    res.status(200).json({ clients, count });
}


const count = async (req, res) => {
    clients = await Client.find({userId:userFunction.id})
        .count();
    res.status(200).json(clients);
}

const allActive = async (req, res) => {
    let userFunction = decoded(req,res)
    let districts = await Client.find({ userId:userFunction.id, status:1 }).lean()
    res.status(200).json(districts);
}

const allActiveClient = async (req, res) => {
    let userFunction = decoded(req,res)
    let districts = await Client.find({ userId:userFunction.id, status:1 }).lean()
    res.status(200).json(districts);
}


const changeStatus = async (req, res) => {
    if (req.params.id) {
        const _id = req.params.id
        let status = req.query.status;
        let client = await Client.findOne({_id}).lean()
        if(req.query.status) {
            client.status = parseInt(status)
        } else {
            client.status = client.status == 0 ? 1 : 0
        }
        let upstatus = await Client.findByIdAndUpdate(_id,client)
        let saveClient = await Client.findOne({_id:_id}).populate(['user', 'subrealisator', 'district']).lean()
        saveClient.createdAt = saveClient.createdAt.toLocaleString("en-GB")
        res.status(200).send(saveClient)
    } else {
        res.status(400).send({message: "Id не найдено"})
    }
}

const create = async (req, res) => {
    let { login, password, name, subrealisator, phone, region, district, inn, mfo, address, debt, check, limit } = req.body;
    login = "+998 " + login
    const haveLogin = await User.findOne({login});
    if (haveLogin) {
        return res.status(400).json({message: `Такой логин есть`});
    }
    let userFunction = decoded(req,res)
    const hashPass = await bcrypt.hash(password, 10);
    let newUser = await new User({ login, password:hashPass, role:'client' });
    await newUser.save();

    const client = await new Client({ user:newUser._id, userId:userFunction.id, name, subrealisator, phone, region, district, inn, mfo, address, debt, check, limit, createdAt:Date.now() });
    await client.save();
    let newClient = await Client.findOne({_id:client._id}).populate(['user', 'subrealisator', 'district']).lean()
    newClient.createdAt = newClient.createdAt.toLocaleString("en-GB")
    return res.status(201).json(newClient);
}

const update = async (req, res) => {
    if (req.params.id) {
        let id = req.params.id;
        let { login, password, name, subrealisator, phone, region, district, inn, mfo, address, debt, check, limit } = req.body;
        let client = await Client.findOneAndUpdate({_id:id},{ name, subrealisator, phone, region, district, inn, mfo, address, debt, check, limit, updateAt:Date.now()}, {returnDocument: 'after'});
        let userId = client.user._id;
        let user = await User.findOne({_id: userId});
        user.login = "+998 " + login;
        if(password) {
            const hashPass = await bcrypt.hash(password, 10);
            user.password = hashPass;
        }
        await User.findByIdAndUpdate(user._id,user);
        let saveClient = await Client.findOne({_id:client._id}).populate(['user', 'subrealisator', 'district']).lean();
        saveClient.createdAt = saveClient.createdAt.toLocaleString("en-GB")
        res.status(200).json(saveClient);
    } else {
        res.status(500).json({message: "Не найдено id"});
    }
}

const findOne = async (req, res) => {
    const _id = req.params.id;
    let client = await Client.findOne({_id}).populate(['user', 'subrealisator', 'district']).lean();
    res.status(200).json(client);
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let client = await Client.findByIdAndDelete(_id);
        await User.findByIdAndDelete({_id:client.user});
        res.status(200).json({message:'Удалено!', data: client._id});
    } else {
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all, count, allActive, changeStatus, create, update, findOne, del }