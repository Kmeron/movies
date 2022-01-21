const { sequelize } = require('../../db.js')
const { Movie } = require('../../models/movie.js')
const { Actor } = require('../../models/actor')
const Joi = require('joi')

async function importMovies (payload) {
  const movies = payload.buffer.toString()
    .split('\n\n')
    .filter(rawMovie => rawMovie)
    .map(rawMovie => rawMovie.split('\n'))
    .map(rawMovie => rawMovie.map(row => row.split(': ')))
    .map(rawMovie => {
      return {
        title: rawMovie[0][1],
        year: +rawMovie[1][1],
        format: rawMovie[2][1],
        actors: rawMovie[3][1].split(', ')
      }
    })

  const transaction = await sequelize.transaction()

  try {
    const areMoviesExist = await Movie.findAll({
      where: {
        userId: payload.userId,
        title: movies.map(movie => movie.title)
      },
      transaction
    })

    const moviesToCreate = movies.filter(movie => areMoviesExist.every(m => m.title !== movie.title))

    const actors = moviesToCreate.flatMap(movie => movie.actors)

    const dbActors = (await Promise.all(actors.map(actor => Actor.findOrCreate({ where: { name: actor }, transaction }))))
      .map(actor => actor[0])

    const bulkMovies = moviesToCreate.map(movie => {
      return { ...movie, userId: payload.userId }
    })
    const createdMovies = await Movie.bulkCreate(bulkMovies, { transaction })

    await Promise.all(createdMovies.map(movie => {
      const _actors = moviesToCreate.find(m => m.title === movie.title).actors
      const actorsIds = dbActors.filter(actor => _actors.some(a => a === actor.name)).map(actor => actor.id)
      const uniqueActorsIds = [...new Set(actorsIds)]
      return movie.setActors(uniqueActorsIds, { transaction })
    }))

    await transaction.commit()
    const imported = createdMovies.length
    const total = await Movie.count({ where: { userId: payload.userId } })
    const meta = { imported, total }
    const data = createdMovies.map(movie => {
      return {
        id: movie.id,
        title: movie.title,
        year: movie.year,
        format: movie.format,
        createdAt: movie.createdAt,
        updatedAt: movie.updatedAt
      }
    })

    return { data, meta }
  } catch (error) {
    await transaction.rollback()

    throw error
  }
}

const validationRules = {
  userId: Joi.number()
    .integer()
    .positive()
    .required(),
  fieldname: Joi.string()
    .required(),
  originalname: Joi.string()
    .required(),
  encoding: Joi.string()
    .valid('7bit')
    .required(),
  mimetype: Joi.string()
    .valid('text/plain')
    .required(),
  buffer: Joi.binary()
    .required(),
  size: Joi.number()
    .positive()
    .required()
}

module.exports = { service: importMovies, validationRules }
