const express = require('express')
const router = express.Router()
const controllers = require('./controllers')
const { checkSession } = require('./middlewares')
const multer = require('multer')
const upload = multer()

router
  .route('/users')
  .post(controllers.users.create)

router
  .route('/sessions')
  .post(controllers.users.authorize)

router
  .route('/movies')
  .post(checkSession, controllers.movies.create)
  .get(checkSession, controllers.movies.list)

router
  .route('/movies/:id')
  .delete(checkSession, controllers.movies.delete)
  .patch(checkSession, controllers.movies.update)
  .get(checkSession, controllers.movies.show)

router
  .route('/movies/import')
  .post(checkSession, upload.single('movies'), controllers.movies.upload)

module.exports = router
