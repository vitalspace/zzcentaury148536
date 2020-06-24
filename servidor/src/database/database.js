'use strict'
/* Dependencies */
const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')
/* Model */
const model = require('../model/global.model')
/* Controllers */
let db
const db_cotroller = {}
/* Methods */
db_cotroller.createConnection = async () => {
    const adapter = new FileAsync('db.json')
    db = await low(adapter)
    db.defaults({ spotify: [model], deezer: [model], lbry: [], token: [] }).write()
}    
db_cotroller.getConnection = () => db
/* Exports */
module.exports = db_cotroller
