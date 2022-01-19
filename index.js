const express = require('express')
const { sequelize } = require('./sequelize')
const { port } = require('./config.js')
const router = require('./router')

const app = express()

app
  .use(express.json())
  .use('/api/v1', router)

sequelize.sync()
  .then(() => app.listen(port, console.log(`App listen on port: ${port}`)))
