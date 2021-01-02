import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'

import handleAPI from './API'
import handlePrint from './Print'

const app = express()

export default functions
	.runWith({ timeoutSeconds: 540, memory: '2GB' })
	.https
	.onRequest(app)

app.use(cors())

handleAPI(app)
handlePrint(app)
