
const port = process.env.APP_PORT
const storagePass = './movies.db'

const saltRounds = 10
const jwtSecret = '0A15FAEB278F6DA0C8925F772E4BE3CF5719F41AA37B73AD0802DE5A8F1AC67E'

module.exports = { port, saltRounds, jwtSecret, storagePass }
