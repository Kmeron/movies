const { sequelize } = require('../../db.js')
const { Movie } = require('../../models/movie.js')
const ServiceError = require('../../ServiceError')
const { Op } = require('sequelize')
const { Actor } = require('../../models/actor.js')

async function listMovies ({ sort = 'id', order = 'ASC', limit = 20, offset = 0, userId, ...params }) {
  const transaction = await sequelize.transaction()

  try {
    const { rows, count } = await Movie.findAndCountAll(parseQuery(params, sort, order, limit, offset, userId), { transaction })// Transaction?
    console.log(params)
    if (!count) {
      throw new ServiceError({
        fields: {
          ...params
        },
        code: 'NOT FOUND'
      })
    }

    const data = rows.map(movie => {
      return {
        id: movie.id,
        title: movie.title,
        year: movie.year,
        format: movie.format,
        createdAt: movie.createdAt,
        updatedAt: movie.updatedAt
      }
    })

    const meta = { total: count }

    await transaction.commit()
    return { data, meta }
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

function parseQuery (params, sort, order, limit, offset, userId) {
  let query = {
    where: [
      { userId }
    ],
    order: [[sort, order]],
    limit,
    offset
  }

  if (params.title) {
    query.where.push({ title: { [Op.substring]: params.title } })
  } else if (params.actor) {
    query.include = [{ model: Actor, as: 'actors', where: { name: { [Op.substring]: params.actor } } }]
  } else if (params.search) {
    query = {
      where: { userId, title: { [Op.substring]: params.search } },
      include: [{ model: Actor, as: 'actors', where: { name: { [Op.substring]: params.search } } }],
      order: [[sort, order]],
      limit,
      offset
    }
  }
  return query
}

module.exports = { service: listMovies }
