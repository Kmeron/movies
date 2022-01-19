const { sequelize } = require('../../db.js')
const { Movie } = require('../../models/movie.js')
const { Actor } = require('../../models/actor')
const ServiceError = require('../../ServiceError')
const dumpMovie = require('./dumpMovie.js')
const Joi = require('joi')

async function showMovie ({ userId, id }) {
  const transaction = await sequelize.transaction()

  try {
    const movie = await Movie.findOne({
      where: {
        id,
        userId
      },
      include: [{
        model: Actor,
        as: 'actors'
      }],
      transaction
    })

    if (!movie) {
      throw new ServiceError({
        fields: {
          id
        },
        code: 'MOVIE_NOT_FOUND'
      })
    }

    const data = dumpMovie(movie)

    await transaction.commit()
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
  id: Joi.number()
    .integer()
    .positive()
    .required()
}

module.exports = { service: showMovie, validationRules }
