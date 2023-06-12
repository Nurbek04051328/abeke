const Region = require("../../models/settings/region");
const decoded = require("../../service/decoded");
const kirilLotin = require("../../service/kirilLotin");


const all = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let quantity = req.query.quantity || 20;
        let next = req.query.next || 1;
        next = (next-1)*quantity;
        let title = req.query.title || null;
        let regions = [];
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
        regions = await Region.find({...fil, userId:userFunction.id })
            .sort({_id:-1})
            .limit(quantity)
            .skip(next).lean();
        regions = regions.map(item => {
            item.createdTime = item.createdTime.toLocaleString("en-GB")
            return item
        })
        const count = await Region.find({...fil, userId:userFunction.id }).count()
        res.status(200).json({ regions, count });
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}


const count = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        regions = await Region.find({userId:userFunction.id})
            .count();
        res.status(200).json(regions);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const allActive = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        regions = await Region.find({ status:1}).lean()
        res.status(200).json(regions);
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
            let region = await Region.findOne({_id}).lean()
            if(req.query.status) {
                region.status = parseInt(status)
            } else {
                region.status = region.status == 0 ? 1 : 0
            }
            let upstatus = await Region.findByIdAndUpdate(_id,region)
            let saveRegion = await Region.findOne({_id:_id}).lean()
            saveRegion.createdTime = saveRegion.createdTime.toLocaleString("en-GB")
            res.status(200).send(saveRegion)
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
        let { title } = req.body;
        let userFunction = decoded(req,res)

        const region = await new Region({ userId:userFunction.id, title, createdTime:Date.now() });
        await region.save();
        let saveRegion = await Region.findOne({_id:region._id}).lean();
        saveRegion.createdTime = saveRegion.createdTime.toLocaleString("en-GB")
        return res.status(201).json(saveRegion);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const update = async (req, res) => {
    try {
        if (req.params.id) {
            let id = req.params.id;
            let { title } = req.body;
            let region = await Region.findOneAndUpdate({_id:id},{ title, updateTime:Date.now()}, {returnDocument: 'after'});
            let saveRegion = await Region.findOne({_id:region._id}).lean();
            saveRegion.createdTime = saveRegion.createdTime.toLocaleString("en-GB")
            res.status(200).json(saveRegion);
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
        let region = await Region.findOne({_id}).lean();
        res.status(200).json(region);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let region = await Region.findByIdAndDelete(_id);
        res.status(200).json({message:'Удалено!', data: region._id});
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all, count, allActive, changeStatus, create, update, findOne, del }