import firebase from 'firebase-admin'
import { RequestHandler } from 'express'

import { SUPPORT_EMAIL } from '../constants'

const { FieldValue } = firebase.firestore

const firestore = firebase.firestore()
const snapshots: Record<string, FirebaseFirestore.DocumentSnapshot> = {}

const getSnapshot = async (key: string) =>
	Object.prototype.hasOwnProperty.call(snapshots, key)
		? snapshots[key]
		: (snapshots[key] = await firestore.doc(`apiKeys/${key}`).get())

const verifyApiKey: RequestHandler = async ({ query: { key } }, res, next) => {
	if (typeof key !== 'string') {
		res
			.status(400)
			.send('You must send your API key in the "key" query parameter')
		return
	}

	const snapshot = await getSnapshot(key)

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
