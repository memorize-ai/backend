import admin from 'firebase-admin'
import { RequestHandler } from 'express'

import { SUPPORT_EMAIL } from '../constants'

const { FieldValue } = admin.firestore
const firestore = admin.firestore()

const verifyApiKey: RequestHandler = async ({ query: { key } }, res, next) => {
	if (typeof key !== 'string') {
		res
			.status(400)
			.send('You must send your API key in the "key" query parameter')
		return
	}

	const snapshot = await firestore.doc(`apiKeys/${key}`).get()

	if (!snapshot.exists) {
		res.status(401).send('Invalid API key')
		return
	}

	if (!snapshot.get('enabled')) {
		res
			.status(403)
			.send(
				`Your API key has been revoked. Contact ${SUPPORT_EMAIL} for more information.`
			)
		return
	}

	await snapshot.ref.update({
		requests: FieldValue.increment(1)
	})

	next()
}

export default verifyApiKey
