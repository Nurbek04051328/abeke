const Router = require("express");
const router = new Router();
const auth = require('../middleware/auth');
const { all, create, findOne, del, last } = require('../controllers/location');


router.get('/', auth,  all);

router.get('/last/:id', auth,  last);

router.post("/", auth, create);

router.get("/:id", auth, findOne);

router.delete('/:id', auth,  del);




module.exports = router;