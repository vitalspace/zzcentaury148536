'use strict'
/* Dependencies */
const { Router } = require('express')
/* Execute express */
const router = Router()
/* Controllers */
const { index } = require('../../controller/index_controller/index.cotroller')
const { verifyToken , exitsToken} = require('../../controller/verify_controller/verify.controller') 
/* Router */
router.get('/', verifyToken, index)
/* Exports */
module.exports = router