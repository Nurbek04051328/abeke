
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../models/user");
const FactorAdmin = require("../models/factorAdmin");


const addadmin = async (req, res) => {
    try {
        let check = await User.findOne({login:'+998 (99) 799-79-65'});
        if (check){
            res.json({message: "Ошибка, Такой админ уже есть"});
        } else {
            const hashPass = await bcrypt.hash('12345', 10)
            let admin =  await new User({login:'+998 (99) 799-79-65', password: hashPass,role:'superadmin',name:'SuperAdmin'})
            await admin.save()
            res.json({message: "Админ создан"})
        }
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"})
    }
}

const checkLogin = async(req,res) => {
    try {
        let {login} = req.body
        login = "+998 " + login
        const user = await User.findOne({login})
        if (user) {
            return res.status(400).json({message: "Пользователь с таким логином есть!"})
        } else {
            return res.status(200).json({message: "ок"})
        }
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"})
    }
}

const haveLogin = async (req,res) => {
    if (req.body) {
        let { login } = req.body
        login = "+998 " + login
        let have = await User.findOne({login})
        if (have) {
            return res.status(200).send({message: "Пользователь с таким логином есть!"})
        }
        res.status(200).send({message:"ок"})
    }
}

const login = async (req, res) => {
    try {
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
        let data = {
            id: user.id,
            login: user.login,
            role: user.role,
            name: user.name
        }
        return res.status(200).json({
            token,
            user: data
        })
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"})
    }
}

const checkUser = async (req,res) => {
    try {
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
    } catch(e){
        console.log(e);
        res.send({message: 'Ошибка сервера'})
    }
}

const getUser = async (req, res) => {
    try {
        const user = await User.findOne({_id: req.user.id})
        const token = jwt.sign({id: user.id}, process.env.secretKey, {expiresIn: "1d"})
        return res.json({
            token,
            user: {
                id: user.id,
                login: user.login,
            }
        })
    } catch (e) {
        console.log(e);
        res.send({message: "Сервере ошибка"})
    }
}

module.exports = { addadmin, checkLogin, login, checkUser, haveLogin, getUser }