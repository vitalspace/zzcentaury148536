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
    delete_user
} = require('../../controller/spotify_controller/spotify.controler')
const { start } = require('../../controller/spotify_controller/start.spotify.controller')
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
/* Spotify Methods */
router.get('/start/:id', verifyToken, start)

/* Exports */
module.exports = router