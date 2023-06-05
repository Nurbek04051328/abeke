const District = require("../../models/settings/district");
const decoded = require("../../service/decoded");
const kirilLotin = require("../../service/kirilLotin");


const all = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let quantity = req.query.quantity || 20;
        let next = req.query.next || 1;
        next = (next-1)*quantity;
        let title = req.query.title || null;
        let region = req.query.region || null;
        let districts = [];
        let fil = {};
        let othertitle = kirilLotin.kirlot(title)
        if (title) {
            fil = {
                ...fil, $or: [
                    {'title': {$regex: new RegExp(title.toLowerCase(), 'i')}},
                    {'title': {$regex: new RegExp(othertitle.toLowerCase(), 'i')}},
                ]
            }
        }
        if (region) fil = {...fil,region }
        districts = await District.find({...fil, userId:userFunction.id })
            .populate('region')
            .sort({_id:-1})
            .limit(quantity)
            .skip(next).lean();
        districts = districts.map(item => {
            item.createdTime = item.createdTime.toLocaleString("en-GB")
            return item
        })
        const count = await District.find({...fil, userId:userFunction.id }).count()
        res.status(200).json({ districts, count });
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}


const count = async (req, res) => {
    try {
        districts = await District.find({userId:userFunction.id})
            .count();
        res.status(200).json(districts);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const allActive = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let region = req.query.region || null;
        let districts = [];
        let fil = {};
        if (region) fil = {...fil,region }
        districts = await District.find({ ...fil, status:1 }).lean()
        res.status(200).json(districts);
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
            let district = await District.findOne({_id}).lean()
            if(req.query.status) {
                district.status = parseInt(status)
            } else {
                district.status = district.status == 0 ? 1 : 0
            }
            let upstatus = await District.findByIdAndUpdate(_id,district)
            let saveDistrict = await District.findOne({_id:_id}).populate('region').lean()
            saveDistrict.createdTime = saveDistrict.createdTime.toLocaleString("en-GB")
            res.status(200).send(saveDistrict)
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
        let { title, region } = req.body;
        let userFunction = decoded(req,res)

        const district = await new District({ userId:userFunction.id, title, region, createdTime:Date.now() });
        await district.save();
        let saveDistrict = await District.findOne({_id:district._id}).populate('region').lean();
        saveDistrict.createdTime = saveDistrict.createdTime.toLocaleString("en-GB")
        return res.status(201).json(saveDistrict);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const update = async (req, res) => {
    try {
        if (req.params.id) {
            let id = req.params.id;
            let { title, region } = req.body;
            let district = await District.findOneAndUpdate({_id:id},{ title, region, updateTime:Date.now()}, {returnDocument: 'after'});
            let saveDistrict = await District.findOne({_id:district._id}).populate('region').lean();
            saveDistrict.createdTime = saveDistrict.createdTime.toLocaleString("en-GB")
            res.status(200).json(saveDistrict);
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
        let district = await District.findOne({_id}).populate('region').lean();
        res.status(200).json(district);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let district = await District.findByIdAndDelete(_id);
        res.status(200).json({message:'Удалено!', data: district._id});
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all, count, allActive, changeStatus, create, update, findOne, del }