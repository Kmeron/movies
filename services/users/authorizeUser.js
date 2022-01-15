const bcrypt = require('bcrypt')
const jwt = require('jwt-simple')
const { sequelize } = require('../../db.js')
const { User } = require('../../models/user.js')
const ServiceError = require('../../ServiceError.js')
const { jwtSecret } = require('../../config.js')

async function authorizeUser ({ email, password }) {
  const transaction = await sequelize.transaction()

  try {
    const user = await User.findOne({
      where: {
        email
      }
    }, { transaction })

    if (!user) {
      throw new ServiceError({
        fields: {
          email: 'AUTHENTICATION_FAILED',
          password: 'AUTHENTICATION_FAILED'
        },
        code: 'AUTHENTICATION_FAILED'
      })
    }

    const passwordCompareResult = await bcrypt.compare(password, user.password)

    if (!passwordCompareResult) {
      throw new ServiceError({
        fields: {
          email: 'AUTHENTICATION_FAILED',
          password: 'AUTHENTICATION_FAILED'
        },
        code: 'AUTHENTICATION_FAILED'
      })
    }

    const dumpedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      updatedAt: user.updatedAt,
      createdAt: user.createdAt,
      iat: Math.round(Date.now() / 1000)
    }

    const token = jwt.encode(dumpedUser, jwtSecret)

    await transaction.commit()

    return { token }
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

module.exports = { service: authorizeUser }
