
const bcrypt = require('bcrypt');
const FactorAdmin = require("../models/factorAdmin");
const User = require("../models/user");


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
            if(req.query.status) {
                factoryAdmin.status = parseInt(status)
            } else {
                factoryAdmin.status = factoryAdmin.status == 0 ? 1 : 0
            }
            let upstatus = await FactorAdmin.findByIdAndUpdate(_id,factoryAdmin)
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
        login = "+998 " + login
        const haveLogin = await User.findOne({login});
        if (haveLogin) {
            return res.status(400).json({message: `Такой логин есть`});
        }

        const hashPass = await bcrypt.hash(password, 10);
        let newUser = await new User({ login, password:hashPass, role:'admin' });
        await newUser.save();

        const factorAdmin = await new FactorAdmin({ user:newUser._id, name, phone, email, status, createdAt:Date.now() });
        await factorAdmin.save();
        let newFactoryAdmin = await FactorAdmin.findOne({_id:factorAdmin._id}).populate('user').lean()
        newFactoryAdmin.createdAt = newFactoryAdmin.createdAt.toLocaleString("en-GB")
        return res.status(201).json(newFactoryAdmin);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const update = async (req, res) => {
    try {
        if (req.params.id) {
            let id = req.params.id;
            let { login, password, name, phone, email } = req.body;
            login = "+998 " + login
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
        let _id = req.params.id;
        let factorAdmin = await FactorAdmin.findByIdAndDelete(_id);
        await User.findByIdAndDelete({_id:factorAdmin.user});
        res.status(200).json({message:'Удалено!', data: factorAdmin._id});
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all, count, changeStatus, create, update, findOne, del }