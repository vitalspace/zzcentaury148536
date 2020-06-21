'use strict'
/* Dependencies */
const fetch = require('node-fetch')
/* DB */
const { getConnection } = require('../../database/database')
/* Controller */
const indexCtrl = {}
/* Methods */
indexCtrl.singupView = (req, res) => {
  res.render('forms/singup')
}

indexCtrl.singup = (req, res) => {
  const { name, email, password, confirm_password, direction } = req.body

  const body = {
    name,
    email,
    password,
    confirm_password,
    direction
  }

  fetch('http://localhost:7777/api/singup', {
    method: 'post',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => res.json())
    .then(json => {

      if (json.Message === "This email already exists.") {
        req.flash('error_msg', json.Message)
        res.redirect('/singup')
      }

      if (json.Message === "The password's must be the same.") {
        req.flash('error_msg', json.Message)
        res.redirect('/singup')
      }

      if (json.Message === "The password must be more than 4 characters.") {
        req.flash('error_msg', json.Message)
        res.redirect('/singup')
      }

      if (json.token) {
        req.flash('success_msg', 'Registration completed successfully')
        res.redirect('/singin')
      }

    });
}

indexCtrl.singinView = (req, res) => {
  res.render('forms/singin')
}

indexCtrl.singin = async (req, res) => {
  const { email, password } = req.body
  const data = { email, password }

  const result = await (await fetch('http://localhost:7777/api/singin', {
    method: 'post',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  })).json();


  if (result.Message === "The email doesn't exists") {
    req.flash('error_msg', result.Message)
    res.redirect('/singin')
  }

  if (result.Message === "The password is wrong") {
    req.flash('error_msg', result.Message)
    res.redirect('/singin')
  }

  if (result.token) {
    getConnection().get('token').push(result.token).write()
    res.redirect('/')
  }
}

indexCtrl.profile = async (req, res) => {
  const token = getConnection().get('token').value()[0]
  const profile = await (await fetch('http://localhost:7777/api/profile', {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`
    }
  })).json();

  res.render('profile/profile', {
    profile
  })
}

indexCtrl.render_edit_direction = async (req, res) => {
  const token = getConnection().get('token').value()[0]
  const profile = await (await fetch('http://localhost:7777/api/profile', {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`
    }
  })).json();

  res.render('profile/edit-direction', {
    profile
  })
}

indexCtrl.edit_direction = async (req, res) => {
  const token = getConnection().get('token').value()[0]
  const { newDirection } = req.body
  const body = { newDirection }

  const result = await (await fetch('http://localhost:7777/api/new-direction', {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`
    }
  })).json();

  if (result.Message === 'Your new direction has been saved.') {
    req.flash('api_success', result.Message)
    res.redirect('/edit-direction')
  }
}

indexCtrl.render_new_password = async (req, res) => {
  res.render('profile/new-password')
}

indexCtrl.new_password = async (req, res) => {
  const token = getConnection().get('token').value()[0]
  const { newPassword, confirm_new_password } = req.body
  const body = { newPassword, confirm_new_password}

  const result = await (await fetch('http://localhost:7777/api/new-password', {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`
    }
  })).json();

  if (result.Message === 'Your Passwords must be the same.') {
    req.flash('api_errors', result.Message)
    res.redirect('/new-password')
  }

  if (result.Message === 'The password must be more than 4 characters.') {
    req.flash('api_errors', result.Message)
    res.redirect('/new-password')
  }

  if (result.Message === 'Your new password has been saved.') {
    req.flash('api_success', result.Message)
    res.redirect('/new-password')
  }

}

module.exports = indexCtrl