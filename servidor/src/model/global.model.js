'use strict'
/* Dependencies */
const { v4: uuidv4 } = require('uuid')
/* Model */
const model = {
    "id": uuidv4(),
    "name": "local",
    "type": "local",
    "ip": "127.0.0.1",
    "accounts": []
}
/* Export */
module.exports = model