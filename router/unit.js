const Router = require("express");
const router = new Router();
const auth = require('../middleware/auth');
const { all, count, allActive, create, changeStatus, update, findOne, del } = require('../controllers/unit');


router.get('/', auth,  all);

router.get('/count', auth,  count);

router.get('/active', auth,  allActive);

router.post("/", auth, create);

router.get("/change/:id/:status", auth, changeStatus);

router.get("/:id", auth, findOne);

router.put('/:id', auth, update);

router.delete('/:id', auth,  del);




module.exports = router;