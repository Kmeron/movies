const { sequelize } = require('../../db.js')
const { Movie } = require('../../models/movie.js')
const { Actor } = require('../../models/actor')
const ServiceError = require('../../ServiceError.js')
const dumpMovie = require('./dumpMovie')
const Joi = require('joi')

async function createMovie ({ actors, ...payload }) {
  const transaction = await sequelize.transaction()
  try {
    const isMovieExist = await Movie.findOne({
      where: {
        userId: payload.userId,
        title: payload.title
      },
      transaction
    })

    if (isMovieExist) {
      throw new ServiceError({
        fields: {
          title: 'NOT_UNIQUE'
        },
        code: 'MOVIE_EXISTS'
      })
    }

    const areActorsExist = await Actor.findAll({ where: { name: actors }, transaction })

    const actorsToCreate = (actors.filter(actor => areActorsExist.every(a => a.name !== actor))).map(actor => ({ name: actor }))

    const createdActorsIds = (await Actor.bulkCreate(actorsToCreate, { transaction })).map(actor => actor.id)

    const existedActorsIds = areActorsExist.map(actor => actor.id)

    const createdMovie = await Movie.create(payload, { transaction })

    const ids = createdActorsIds ? [...existedActorsIds, ...createdActorsIds] : [...existedActorsIds]

    await createdMovie.setActors(ids, { transaction })

    await transaction.commit()

    const result = await Movie.findOne({
      where: {
        id: createdMovie.id
      },
      include: [{
        model: Actor,
        as: 'actors'
      }]
    })

    const data = dumpMovie(result)

    return { data }
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
    .required()
}

module.exports = { service: createMovie, validationRules }
