'use strict'
/* Dependencies */
const fs = require('fs-extra')
const fetch = require('node-fetch')
/* DB */
const { getConnection } = require('../../database/database')
/* Controller */
const indexCtrl = {}
/* Methods */
indexCtrl.index = async (req, res) => {
    const token = getConnection().get('token').value()
    const news = await (await fetch('http://localhost:7777/api/news', {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${token[0]}`
        }
    })).json();
    res.render('index', {
        news
    })
}
/* Export */
module.exports = indexCtrl











