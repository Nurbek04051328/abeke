const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../models/user");
const FactorAdmin = require("../models/factorAdmin");
const Realisator = require("../models/realisator");
const Subrealisator = require("../models/subrealisator");


const addadmin = async (req, res) => {
    let check = await User.findOne({login:'+998 (99) 799-79-65'});
    if (check){
        res.json({message: "Ошибка, Такой админ уже есть"});
    } else {
        const hashPass = await bcrypt.hash('12345', 10)
        let admin =  await new User({login:'+998 (99) 799-79-65', password: hashPass,role:'superadmin',name:'SuperAdmin'})
        await admin.save()
        res.json({message: "Админ создан"})
    }
}

const checkLogin = async(req,res) => {
    let {login} = req.body
    const user = await User.findOne({login})
    if (user) {
        res.status(204).send({message: "Пользователь с таким логином есть!"})
    } else {
        res.status(200).send({message: "ок"})
    }
}

const mobCheckLogin = async(req,res) => {
    let {login} = req.body
    const user = await User.findOne({login})
    if (user) {
        res.status(401).send({message: "Пользователь с таким логином есть!"})
    } else {
        res.status(200).send({message: "ок"})
    }
}

const login = async (req, res) => {
    let {login, password } = req.body
    const user = await User.findOne({login})
    if (!user) {
        return res.status(404).json({message: "Пользователь не найдено!"})
    }
    const isPassValid = bcrypt.compareSync(password, user.password)
    if (!isPassValid) {
        return res.status(400).json({message: "Пароль не правильно!"})
    }
    console.log("user",user)
    if (user.status !== 1) {
        return res.status(404).json({message: "У вас нет доступа к этому сайту"})
    }
    const token = jwt.sign({id: user.id}, process.env.SecretKey, {expiresIn: "1d"})
    let findData = {}
    if (user.role == 'realisator') {
        findData = await Realisator.findOne({user:user._id}).select(['name', 'phone']).lean();
    }
    if (user.role == 'subrealisator') {
        findData = await Subrealisator.findOne({user:user._id}).select(['name', 'phone']).lean();
    }
    let data = {
        id: user.id,
        login: user.login,
        role: user.role,
        user: findData
    }
    return res.status(200).json({
        token,
        user: data
    })
}

const checkUser = async (req,res) => {
    const user = await User.findOne({_id: req.user.id})
    if (!user){
        return res.status(404).json({message: "Пользователь не найдено!"})
    }
    let data = {
        id: user.id,
        login: user.login,
        role: user.role,
        name: user.name
    }
    res.status(200).json(data)
}

const getUser = async (req, res) => {
    const user = await User.findOne({_id: req.user.id})
    const token = jwt.sign({id: user.id}, process.env.secretKey, {expiresIn: "1d"})
    return res.json({
        token,
        user: {
            id: user.id,
            login: user.login,
        }
    })
}

// const gettUsers = async  (req, res) => {
//     let users = await User.find().lean()
//     users.forEach(async user => {
//         user.status = 1
//         await User.findOneAndUpdate({_id:user._id},user, {returnDocument: 'after'});
//     })
//     res.status(200).send("Muvaffaqiyatli");
// }
//
// const getHammasi = async  (req, res) => {
//     let users = await User.find().lean()
//
//     res.status(200).send(users);
// }

module.exports = { addadmin, login, checkUser, checkLogin, getUser, mobCheckLogin }