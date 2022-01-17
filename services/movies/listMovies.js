const { sequelize } = require('../../db.js')
const { Movie } = require('../../models/movie.js')
const ServiceError = require('../../ServiceError')
const { Op } = require('sequelize')
const { Actor } = require('../../models/actor.js')

async function listMovies ({ sort = 'id', order = 'ASC', limit = 20, offset = 0, ...params }) {
  const transaction = await sequelize.transaction()

  try {
    const { rows, count } = await Movie.findAndCountAll(parseQuery(params, sort, order, limit, offset), { transaction })
    console.log(rows)
    console.log(count)
    // const data = rows.map(element => dumpNote(element.dataValues))
    // const meta = { limit: params.limit, offset: params.offset, totalCount: count }
    await transaction.commit()
    return { }
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

function parseQuery (params, sort, order, limit, offset) {
  let query = {
    where: [
      { userId: params.userId }
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
      where: { userId: params.userId, title: { [Op.substring]: params.search } },
      include: [{ model: Actor, as: 'actors', where: { name: { [Op.substring]: params.search } } }]
    }
  }
  return query
}

module.exports = { service: listMovies }
