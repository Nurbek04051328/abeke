const {Router} = require('express');
const router = Router();


router.use('/auth', require("./router/auth"));
// router.use('/user', require("./router/user"));


// SuperAdmin
router.use('/factoryadmin', require("./router/factorAdmin"));
// FactorAdmin
router.use('/factory', require("./router/factory"));
router.use('/realisator', require("./router/realisator"));
// Factor
router.use('/subrealisator', require("./router/subrealisator"));
router.use('/client', require("./router/client"));
router.use('/typeprice', require("./router/typeprice"));
router.use('/category', require("./router/category"));
router.use('/product', require("./router/product"));
router.use('/region', require("./router/settings/region"));
router.use('/district', require("./router/settings/district"));
router.use('/typeproduct', require("./router/typeproduct"));
router.use('/worker', require("./router/worker"));

//Realisator
router.use('/location', require("./router/location"));


module.exports = router