const express = require('express')
const router = express.Router()
const controllers = require('./controllers')
const { checkSession } = require('./middlewares')

router
  .route('/users')
  .post(controllers.users.create)

router
  .route('/sessions')
  .post(controllers.users.authorize)

router
  .route('/movies')
  .post(checkSession, controllers.movies.create)

module.exports = router
