import * as functions from 'firebase-functions'
import firebase from 'firebase-admin'

import getNotification, { TIME_STEP } from '..'
import Notification, { sendNotifications } from '../Notification'
import { cauterize } from '../../utils'

const SCHEDULE = `*/${TIME_STEP} * * * *`

const firestore = firebase.firestore()
let userSnapshots: FirebaseFirestore.DocumentSnapshot[] | null = null

const getUserSnapshots = async () =>
	(userSnapshots ??= (await firestore.collection('users').get()).docs)

const collect = async () => {
	const users = await getUserSnapshots()
	const notifications: Notification[] = []

	await Promise.all(
		users.map(async user => {
			const notification = await getNotification(user)
			if (notification) notifications.push(...notification)
		})
	)

	const chunks = await sendNotifications(notifications)

	for (const { failureCount, responses } of chunks) {
		if (!failureCount) continue
		for (const { error } of responses) if (error) console.error(error)
	}
}

export default functions
	.runWith({ timeoutSeconds: 540, memory: '2GB' })
	.pubsub.schedule(SCHEDULE)
	.onRun(cauterize(collect))
