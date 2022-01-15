const { makeServiceRunner } = require('./makeServiceRunner')

const create = require('../services/movies/createMovie')

module.exports = {
  create: makeServiceRunner(create, (req, res) => ({ ...req.body, ...res.locals }))
}
