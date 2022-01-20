const { sequelize } = require('../../db.js')
const { Movie } = require('../../models/movie.js')
const { Actor } = require('../../models/actor')
const dumpMovie = require('./dumpMovie')
const ServiceError = require('../../ServiceError')
const Joi = require('joi')

async function updateMovie ({ userId, ...movie }) {
  const transaction = await sequelize.transaction()

  try {
    const isMovieExist = await Movie.findOne({
      where: {
        userId,
        id: movie.id
      },
      include: [{
        model: Actor,
        as: 'actors'
      }],
      transaction
    })

    if (!isMovieExist) {
      throw new ServiceError({
        fields: {
          id: movie.id
        },
        code: 'MOVIE_NOT_FOUND'
      })
    }

    await Movie.update({
      title: movie.title,
      year: movie.year,
      format: movie.format
    }, {
      where: {
        userId,
        id: movie.id
      },
      transaction
    })

    const previousActorsIds = isMovieExist.actors.map(actor => actor.id)
    await isMovieExist.removeActors(previousActorsIds, { transaction })

    const areActorsExist = await Actor.findAll({ where: { name: movie.actors } })

    const actorsToCreate = (movie.actors.filter(actor => areActorsExist.every(a => a.name !== actor))).map(actor => ({ name: actor }))

    const createdActorsIds = (await Actor.bulkCreate(actorsToCreate, { transaction })).map(actor => actor.id)

    const existedActorsIds = areActorsExist.map(actor => actor.id)

    const ids = createdActorsIds ? [...existedActorsIds, ...createdActorsIds] : [...existedActorsIds]

    await isMovieExist.setActors(ids, { transaction })

    await transaction.commit()

    const updatedMovie = await Movie.findOne({
      where: {
        userId,
        id: movie.id
      },
      include: [{
        model: Actor,
        as: 'actors'
      }]
    })

    const data = dumpMovie(updatedMovie)

    return { data }
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

const validationRules = {
  userId: Joi.number()
    .integer()
    .positive(),
  id: Joi.number()
    .integer()
    .positive(),
  title: Joi.string()
    .required(),
  year: Joi.number()
    .integer()
    .positive()
    .required(),
  format: Joi.string()
    .valid('VHS', 'DVD', 'Blu-Ray')
    .required(),
  actors: Joi.array()
    .items(Joi.string())
}

module.exports = { service: updateMovie, validationRules }
