const { sequelize } = require('../../db.js')
const { Movie } = require('../../models/movie.js')
const ServiceError = require('../../ServiceError')
// const { Op } = require('sequelize')

async function listMovies ({ sort = id, order = 'ASC', limit = 20, offset = 0, ...params }) {
  console.log(params)
  console.log(sort)
  console.log(order)
  console.log(limit)
  // const transaction = await sequelize.transaction()

  // try {
  //   const { rows, count } = await Note.findAndCountAll(parseQuery(params), { transaction })
  //   const data = rows.map(element => dumpNote(element.dataValues))
  //   const meta = { limit: params.limit, offset: params.offset, totalCount: count }
  //   await transaction.commit()
  //   return { data, meta }
  // } catch (error) {
  //   await transaction.rollback()
  //   if (['ER_PARSE_ERROR', 'ER_SP_UNDECLARED_VAR'].includes(error.code)) {
  //     throw new ServiceError({
  //       message: 'Provided invalid data for getting note',
  //       code: 'INVALID_DATA'
  //     })
  //   }
  //   throw error
  // }
}

function parseQuery (params, sort, order, limit, offset) {
  const query = {
    where: [
      { userId: params.userId }
    ],
    group: sort,
    order: [['id', order]],
    limit,
    offset
  }

  // if (params.search) {
  //   query.where.push(sequelize.literal(`MATCH (title,text) AGAINST ('(${params.search}*) ("${params.search}")' IN BOOLEAN MODE)`)) // Sql injection
  // }
  return query
}

module.exports = { service: listMovies }
