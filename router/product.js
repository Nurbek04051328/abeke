const Router = require("express");
const router = new Router();
const auth = require('../middleware/auth');
const { all, count, create, changeStatus, allActive, update, findOne, del, createPhoto, deleteImg, findRealis, forTypeprice } = require('../controllers/product');


router.get('/', auth,  all);

router.post("/", auth, create);

// Mobile Realisatorlar uchun
router.get('/realtype', auth,  findRealis);

router.get('/fortypeproduct', auth,  forTypeprice);

router.get('/count', auth,  count);

router.get('/active', auth,  allActive);

router.post("/photo", createPhoto);

router.post("/delphoto", deleteImg);

router.get("/change/:id/:status", auth, changeStatus);

router.get("/:id", auth, findOne);

router.put('/:id', auth, update);

router.delete('/:id', auth,  del);






module.exports = router;