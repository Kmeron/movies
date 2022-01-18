const { sequelize } = require('../../db')
const { User } = require('../../models/user')
const ServiceError = require('../../ServiceError')
const bcrypt = require('bcrypt')
const { saltRounds, jwtSecret } = require('../../config')
const jwt = require('jwt-simple')

async function createUser (newUser) {
  const transaction = await sequelize.transaction()

  try {
    const isUserExist = await User.findOne({
      where: {
        email: newUser.email
      },
      transaction
    })

    if (isUserExist) {
      throw new ServiceError({
        fields: {
          email: 'NOT_UNIQUE'
        },
        code: 'EMAIL_NOT_UNIQUE'
      })
    }

    const hash = await bcrypt.hash(newUser.password, saltRounds)

    const user = await User.create({
      email: newUser.email,
      name: newUser.name,
      password: hash
    }, { transaction })

    const dumpedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      updatedAt: user.updatedAt,
      createdAt: user.createdAt,
      iat: Math.round(Date.now() / 1000)
    }

    const token = jwt.encode({ dumpedUser }, jwtSecret)

    await transaction.commit()

    return { token }
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

module.exports = { service: createUser }
