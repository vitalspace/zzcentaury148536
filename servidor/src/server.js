'use strict'
/* Dependencies */
const path =  require('path')
const express = require('express')
const flash = require('connect-flash')
const session = require('express-session')
const bodyparser = require('body-parser')
const run = require('./functions/web')
run()
/* Execute Epress */
const app = express()
/* Settings */
app.set('view engine', 'ejs')
app.set('appname', 'vitalbot')
app.set('port', process.env.PORT || 4000)
app.set('views', path.join(__dirname, 'views'))
/* Midddleware */
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))
/* Flash */
app.use(flash())
/* GLobals */
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.api_success = req.flash('api_success')
    res.locals.api_errors = req.flash('api_errors')
    next()
})
/* Routes */
app.use(require('./routes/index_routes/index.routes'))
app.use(require('./routes/user_routes/user.routes'))
app.use('/spotify', require('./routes/spotify_routes/spotify.routes'))
app.use('/deezer', require('./routes/deezer_routes/deezer.routes'))
app.use('/lbry', require('./routes/lbry_routes/lbry_routes'))
/* 404 */
app.get('*', (req, res) => res.send(`This page don't found`))
/* Module Exports */
module.exports = app
