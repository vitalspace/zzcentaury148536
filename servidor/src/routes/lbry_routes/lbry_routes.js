'use strict'
/* Dependencies */
const { Router } = require('express')
const router = Router()
/* Controllers */
const { verifyToken } = require('../../controller/verify_controller/verify.controller')
const { index } = require('../../controller/lbry_controller/lbry.controller')
/* Router */
router.get('/', verifyToken, index)
/* Exports */
module.exports = router