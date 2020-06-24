'use strict'
/* Dependencies */
const { v4: uuidv4 } = require('uuid')
const fs = require('fs-extra')
/* DB */
const { getConnection } = require('../../database/database')
/* Controller */
const deezer = {}
/* Methods */
deezer.render_index = (req, res) => {
  const deezer_data = getConnection().get('deezer').value()
  res.render('deezer', {
    deezer_data
  })
}

deezer.render_add_proxy = (req, res) => {
  res.render('adddeezerproxy')
}

deezer.add_proxy = (req, res) => {
  const { name, username, password, ip, port } = req.body
  if (name, username, ip, password, port) {
    const newProxy = {
      id: uuidv4(),
      name,
      type: "proxy",
      username,
      password,
      ip,
      port,
      accounts: []
    }
    getConnection().get('deezer').push(newProxy).write()
    req.flash('api_success', 'Proxy added successfully.')
    res.redirect('/deezer')
  }
}

deezer.dete_proxy = (req, res) => {
  getConnection().get('deezer').remove({ id: req.params.id }).write()
  req.flash('api_success', 'Proxy removed successfully.')
  res.redirect('/deezer')
}

deezer.render_edit_proxy = (req, res) => {
  const proxy = getConnection().get('deezer').find({ id:req.params.id }).value()
  res.render('deezer_proxy/proxy', {
    proxy
  })
}

deezer.edit_proxy = async (req, res) => {
  req.flash('api_success', 'Proxy successfully modified.')
  await getConnection().get('deezer').find({ id: req.body.id })
  .assign(req.body)
  .write()
  res.redirect('/deezer')
}

deezer.add_user = (req, res) => {
  const total_accounts = getConnection().get('deezer').find({ id: req.params.id }).get('accounts').value()
  if (total_accounts.length < 4) {
    req.flash('api_success', 'New account added successfully.')
    const user_data = {
      id: uuidv4(),
      name: 'local account',
      img: 'https://image.flaticon.com/icons/png/512/64/64572.png'
    }
    getConnection().get('deezer').find({ id: req.params.id }).get('accounts').push(user_data).write()
  } else {
    req.flash('api_errors', 'Cannot add more accounts')
  }
  res.redirect('/deezer')
}

deezer.add_proxy_user = (req, res) => {
  const total_accounts = getConnection().get('deezer').find({ id: req.params.id }).get('accounts').value()
  if (total_accounts.length < 4) {
    req.flash('api_success', 'New account added successfully.')
    const user_data = {
      id: uuidv4(),
      name: 'proxy account',
      img: 'https://image.flaticon.com/icons/png/512/64/64572.png'
    }
    getConnection().get('deezer').find({ id: req.params.id }).get('accounts').push(user_data).write()
  } else {
    req.flash('api_errors', 'Cannot add more accounts.')
  }
  res.redirect('/deezer')
}

deezer.delete_user = (req, res) => {
  const user_data = req.params.did
  req.flash('api_success', 'Account successfully removed.')
  if (fs.existsSync(user_data)) fs.removeSync(user_data);
  getConnection().get('deezer').find({ id: req.params.id }).get('accounts').remove({ id: req.params.did }).write()
  res.redirect('/deezer')
}

deezer.render_edit_user = (req, res) => {
  const user_data = getConnection().get('deezer').find({ id: req.params.id }).get('accounts').find({ id: req.params.did }).value()
  res.render('deezer_user/edit_user', {
    user_data,
    id: req.params.id
  })
}

deezer.edit_user = async (req, res) => {
  req.flash('api_success', 'User successfully modified.')
  const { did, name, img } = req.body
  const id = did
  const obj = { id, name, img }
  await getConnection().get('deezer').find({ id: req.body.id }).get('accounts').find({ id: req.body.did })
  .assign(obj)
  .write()
  res.redirect('/deezer')
}

module.exports = deezer