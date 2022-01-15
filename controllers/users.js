const { makeServiceRunner } = require('./makeServiceRunner')

const create = require('../services/users/createUser')
const authorize = require('../services/users/authorizeUser')

module.exports = {
  create: makeServiceRunner(create, (req, res) => ({ ...req.body })),
  authorize: makeServiceRunner(authorize, (req, res) => ({ ...req.body }))
}
