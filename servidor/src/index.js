'use strict'
/* Dependincies */
const app = require('./server')
require('colors')
/* Connect db */
const { createConnection } = require('./database/database')
createConnection()
/* Get App Settings */
const port = app.get('port')
const appname = app.get('appname')
/* Server listen */
app.listen(port, ( ) => console.log('Server on port'.green, `${port}`.yellow, 'App name'.green, `${appname}`.red))