'use strict'
/* Depencendies */
const { Router } = require('express')
const router = Router()
/* Controllers */
const { 
    singupView,
    singup,
    singinView,
    singin,
    profile,
    render_edit_direction,
    edit_direction,
    render_new_password,
    new_password
} = require('../../controller/user_controller/user.controller')
/* Verify Token */
const { exitsToken, verifyToken } = require('../../controller/verify_controller/verify.controller')
/* Singup */
router.get('/singup', exitsToken, singupView)
router.post('/singup', exitsToken, singup)
/* Singin */
router.get('/singin', exitsToken, singinView)
router.post('/singin', exitsToken, singin)
/* profile */
router.get('/profile', verifyToken, profile)
/* edit Direction */
router.get('/edit-direction', verifyToken, render_edit_direction)
router.post('/edit-direction', verifyToken, edit_direction)
/* new Password */
router.get('/new-password', verifyToken, render_new_password)
router.post('/new-password', verifyToken, new_password)
/* Exports */
module.exports = router


