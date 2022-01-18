const { sequelize } = require('../../db.js')
const { Movie } = require('../../models/movie.js')
const { Actor } = require('../../models/actor')
const ServiceError = require('../../ServiceError.js')
const dumpMovie = require('./dumpMovie')

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
    const queryActors = actors.map(actor => {
      return { name: actor }
    })

    const areActorsExist = await Promise.all(queryActors.map(actor => Actor.findOne({ where: actor, transaction })))
    const actorsToCompare = areActorsExist.map(actor => {
      if (!actor) {
        return null
      }
      return actor.dataValues.name
    })

    const newActors = []
    for (let i = 0; i <= actorsToCompare.length; i++) {
      if (actorsToCompare[i] !== actors[i]) {
        newActors.push(actors[i])
      }
    }

    let actorsCreateResult
    let actorsToSet
    if (newActors.length) {
      const actorsBulk = newActors.map(actor => {
        return { name: actor }
      })
      actorsCreateResult = await Actor.bulkCreate(actorsBulk, { transaction })
      actorsToSet = actorsCreateResult.map(actor => actor.dataValues.id)
    }

    const createdMovie = await Movie.create(payload, { transaction })

    const existedActorsIds = areActorsExist.filter(actor => actor).map(actor => actor.dataValues.id)

    const ids = actorsToSet ? [...existedActorsIds, ...actorsToSet] : [...existedActorsIds]

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
    console.log(error)
    await transaction.rollback()

    throw error
  }
}

module.exports = { service: createMovie }
