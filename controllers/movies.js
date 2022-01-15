const { makeServiceRunner } = require('./makeServiceRunner')

const create = require('../services/movies/createMovie')
const remove = require('../services/movies/deleteMovie')
const update = require('../services/movies/updateMovie')
const show = require('../services/movies/showMovie')

module.exports = {
  create: makeServiceRunner(create, (req, res) => ({ ...req.body, ...res.locals })),
  delete: makeServiceRunner(remove, (req, res) => ({ ...req.params, ...res.locals })),
  update: makeServiceRunner(update, (req, res) => ({ ...req.params, ...res.locals, ...req.body })),
  show: makeServiceRunner(show, (req, res) => ({ ...req.params, ...res.locals }))
}
