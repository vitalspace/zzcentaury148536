'use strict'
/* DB */
const { getConnection } = require('../../database/database') 
/* Controller */
const verifyCtrl = {}
/* Method */
verifyCtrl.verifyToken = (req, res, next) => {
    const token = getConnection().get('token').value()
    if(!token[0]) return res.redirect('/singin')
    next()
}
verifyCtrl.exitsToken = (req, res, next) => {
    const token = getConnection().get('token').value()
    if(token[0]) return res.redirect('/')
    next()
}
module.exports = verifyCtrl