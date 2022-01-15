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

router
  .route('/movies/:id')
  .delete(checkSession, controllers.movies.delete)
  .patch(checkSession, controllers.movies.update)
  .get(checkSession, controllers.movies.show)

module.exports = router
