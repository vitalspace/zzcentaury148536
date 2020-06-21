'use strict'
/* Dependencies */
const { v4: uuidv4 } = require('uuid')
const fs = require('fs-extra')
/* DB */
const { getConnection } = require('../../database/database')
/* Controller */
const spotify = {}
/* Methods */
spotify.render_index = (req, res) => {
  const spotify_data = getConnection().get('spotify').value()
  res.render('spotify', {
    spotify_data
  })
}

spotify.render_add_proxy = (req, res) => {
  res.render('addspotifyproxy')
}

spotify.add_proxy = (req, res) => {
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
    getConnection().get('spotify').push(newProxy).write()
    req.flash('api_success', 'Proxy added successfully.')
    res.redirect('/spotify')
  }
}

spotify.dete_proxy = (req, res) => {
  getConnection().get('spotify').remove({ id: req.params.id }).write()
  req.flash('api_success', 'Proxy removed successfully.')
  res.redirect('/spotify')
}

spotify.render_edit_proxy = (req, res) => {
  const proxy = getConnection().get('spotify').find({ id:req.params.id }).value()
  res.render('spotify_proxy/proxy', {
    proxy
  })
}

spotify.edit_proxy = async (req, res) => {
  await getConnection().get('spotify').find({ id: req.body.id })
  .assign(req.body)
  .write()
  req.flash('api_success', 'Proxy successfully modified.')
  res.redirect('/spotify')
}

spotify.add_user = (req, res) => {
  const total_accounts = getConnection().get('spotify').find({ id: req.params.id }).get('accounts').value()
  if (total_accounts.length < 4) {
    req.flash('api_success', 'New account added successfully.')
    const user_data = {
      id: uuidv4(),
      name: 'local account',
      img: 'https://image.flaticon.com/icons/png/512/64/64572.png'
    }
    getConnection().get('spotify').find({ id: req.params.id }).get('accounts').push(user_data).write()
  } else {
    req.flash('api_errors', 'Cannot add more accounts')
  }
  res.redirect('/spotify')
}

spotify.add_proxy_user = (req, res) => {
  const total_accounts = getConnection().get('spotify').find({ id: req.params.id }).get('accounts').value()
  if (total_accounts.length < 4) {
    req.flash('api_success', 'New account added successfully.')
    const user_data = {
      id: uuidv4(),
      name: 'proxy account',
      img: 'https://image.flaticon.com/icons/png/512/64/64572.png'
    }
    getConnection().get('spotify').find({ id: req.params.id }).get('accounts').push(user_data).write()
  } else {
    req.flash('api_errors', 'Cannot add more accounts.')
  }
  res.redirect('/spotify')
}

spotify.delete_user = (req, res) => {
  const user_data = req.params.did
  if (fs.existsSync(user_data)) fs.removeSync(user_data);
  getConnection().get('spotify').find({ id: req.params.id }).get('accounts').remove({ id: req.params.did }).write()
  req.flash('api_success', 'Account successfully removed.') 
  res.redirect('/spotify')
}

module.exports = spotify