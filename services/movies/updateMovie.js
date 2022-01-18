const { sequelize } = require('../../db.js')
const { Movie } = require('../../models/movie.js')
const { Actor } = require('../../models/actor')
const dumpMovie = require('./dumpMovie')
const ServiceError = require('../../ServiceError')

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
    }) // returns [0] or [1]

    const previousActorsIds = isMovieExist.actors.map(actor => actor.id)
    console.log(previousActorsIds)
    await isMovieExist.removeActors(previousActorsIds, { transaction })

    const queryActors = movie.actors.map(actor => {
      return { name: actor }
    })

    const isActorsExist = await Promise.all(queryActors.map(actor => Actor.findOne({ where: actor, transaction })))
    const isActorsExistArr = isActorsExist.map(actor => {
      if (!actor) {
        return null
      }
      return actor.dataValues.name
    })

    const newActors = []
    for (let i = 0; i <= isActorsExistArr.length; i++) {
      if (isActorsExistArr[i] !== movie.actors[i]) {
        newActors.push(movie.actors[i])
      }
    }

    let actorsCreateResult
    let actorsToSet
    if (newActors.length) {
      const newActorsArr = newActors.map(actor => {
        return { name: actor }
      })
      actorsCreateResult = await Actor.bulkCreate(newActorsArr, { transaction })
      actorsToSet = actorsCreateResult.map(actor => actor.dataValues.id)
    }

    const existedActorsIds = isActorsExist.filter(actor => actor).map(actor => actor.dataValues.id)

    const ids = actorsToSet ? [...existedActorsIds, ...actorsToSet] : [...existedActorsIds]

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
    console.log(error)
    throw error
  }
}

module.exports = { service: updateMovie }
