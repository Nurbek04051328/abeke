const {Router} = require('express');
const router = Router();


router.use('/auth', require("./router/auth"));
// router.use('/user', require("./router/user"));
router.use('/factoryadmin', require("./router/factorAdmin"));
router.use('/factory', require("./router/factory"));
router.use('/realisator', require("./router/realisator"));
router.use('/subrealisator', require("./router/subrealisator"));


module.exports = router