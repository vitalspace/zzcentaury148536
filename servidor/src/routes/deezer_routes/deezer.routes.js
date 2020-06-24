'use strict'
/* Dependencies */
const { Router } = require('express')
const router = Router()
/* Controllers */
const { verifyToken } = require('../../controller/verify_controller/verify.controller')
const { 
    render_index,
    render_add_proxy,
    add_proxy,
    dete_proxy,
    add_user,
    add_proxy_user,
    render_edit_proxy,
    edit_proxy,
    delete_user,
    render_edit_user,
    edit_user
} = require('../../controller/dezeer_controller/deezer.controller')
const { start } = require('../../controller/dezeer_controller/start.deezer.controller')
/* Router */
router.get('/', verifyToken, render_index)
/* Proxy Methods */
router.get('/addproxy', verifyToken, render_add_proxy)
router.post('/addproxy', verifyToken, add_proxy)
router.get('/deleteproxy/:id', verifyToken, dete_proxy)
router.get('/editproxy/:id', verifyToken, render_edit_proxy)
router.post('/editproxy', verifyToken, edit_proxy)
/* User Methods */
router.get('/adduser/:id', verifyToken, add_user)
router.get('/addproxyuser/:id', verifyToken, add_proxy_user)
router.get('/deleteuser/:id/:did', verifyToken, delete_user)
router.get('/edituser/:id/:did', verifyToken, render_edit_user)
router.post('/edituser', verifyToken, edit_user)
/* Spotify Methods */
router.get('/start/:id/:name', verifyToken, start)

/* Exports */
module.exports = router