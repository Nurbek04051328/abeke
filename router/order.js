const Router = require("express");
const router = new Router();
const auth = require('../middleware/auth');
const { all, count, create, changeStatus, allActive, update, findOne, del } = require('../controllers/order');


router.get('/', auth,  all);

router.post("/", auth, create);

router.get('/count', auth,  count);

router.get('/active', auth,  allActive);

router.get("/change/:id/:status", auth, changeStatus);

router.get("/:id", auth, findOne);

router.put('/:id', auth, update);

router.delete('/:id', auth,  del);






module.exports = router;