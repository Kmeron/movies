const { makeServiceRunner } = require('./makeServiceRunner')

const create = require('../services/movies/createMovie')
const remove = require('../services/movies/deleteMovie')
const update = require('../services/movies/updateMovie')
const show = require('../services/movies/showMovie')
const list = require('../services/movies/listMovies')
const upload = require('../services/movies/importMovies')

module.exports = {
  create: makeServiceRunner(create, (req, res) => ({ ...req.body, ...res.locals })),
  delete: makeServiceRunner(remove, (req, res) => ({ ...req.params, ...res.locals })),
  update: makeServiceRunner(update, (req, res) => ({ ...req.params, ...res.locals, ...req.body })),
  show: makeServiceRunner(show, (req, res) => ({ ...req.params, ...res.locals })),
  list: makeServiceRunner(list, (req, res) => ({ ...res.locals, ...req.query })),
  upload: async (req, res) => {
    const buffers = []

    for await (const chunk of req) {
      buffers.push(chunk)
    }

    const data = Buffer.concat(buffers).toString()

    console.log(data) // movies
    const payload = data.split('\n')
    console.log(payload)

    res.send('ok')
  }
}
