const { sequelize } = require('../../db.js')
const { Movie } = require('../../models/movie.js')
const ServiceError = require('../../ServiceError')
const Joi = require('joi')

async function deleteMovie ({ id, userId }) {
  const transaction = await sequelize.transaction()

  try {
    const isMovieExist = await Movie.findOne({
      where: {
        userId,
        id
      },
      transaction
    })

    if (!isMovieExist) {
      throw new ServiceError({
        fields: {
          id
        },
        code: 'MOVIE_NOT_FOUND'
      })
    }

    await Movie.destroy({
      where: {
        userId,
        id
      },
      transaction
    })

    await transaction.commit()
    return {}
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

module.exports = { service: deleteMovie, validationRules }
