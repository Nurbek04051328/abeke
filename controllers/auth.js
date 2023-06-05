const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../models/user");
const FactorAdmin = require("../models/factorAdmin");
const Realisator = require("../models/realisator");


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
    console.log("body",req.body)
    const user = await User.findOne({login})
    if (user) {
        console.log("user", user)
        res.status(205).send({message: "Пользователь с таким логином есть!"})
    } else {
        console.log("else")
        res.status(200).send({message: "ок"})
    }
}


// const haveLogin = async (req,res) => {
//     let { login } = req.body
//     login = "+998 " + login
//     let have = await User.findOne({login})
//     if (have) {
//         return res.status(200).send({message: "Пользователь с таким логином есть!"})
//     }
//     res.status(200).send({message:"ок"})
// }

const login = async (req, res) => {
    let {login, password} = req.body
    const user = await User.findOne({login})
    if (!user) {
        return res.status(404).json({message: "Пользователь не найдено!"})
    }
    const isPassValid = bcrypt.compareSync(password, user.password)
    if (!isPassValid) {
        return res.status(400).json({message: "Пароль не правильно!"})
    }
    const token = jwt.sign({id: user.id}, process.env.SecretKey, {expiresIn: "1d"})
    let findData = {}
    if (user.role == 'realisator') {
        findData = await Realisator.findOne({user:user._id}).lean();
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

module.exports = { addadmin, login, checkUser, checkLogin, getUser }