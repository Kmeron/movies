const { sequelize } = require('../../db')
const { User } = require('../../models/user')
const ServiceError = require('../../ServiceError')
const bcrypt = require('bcrypt')
const { saltRounds, jwtSecret } = require('../../config')
const jwt = require('jwt-simple')
const Joi = require('joi')

async function createUser (newUser) {
  console.log(newUser)
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

const validationRules = {
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .required(),

  name: Joi.string()
    .required(),

  password: Joi.string()
    .required(),

  confirmPassword: Joi.ref('password')

}

module.exports = { service: createUser, validationRules }
