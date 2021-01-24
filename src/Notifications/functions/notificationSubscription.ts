import * as functions from 'firebase-functions'
import firebase from 'firebase-admin'

import getNotification from '..'
import Notification, { sendNotifications } from '../Notification'
import { cauterize } from '../../utils'

const firestore = firebase.firestore()

export default functions.pubsub.schedule('every 1 minutes').onRun(
	cauterize(async () => {
		const { docs: users } = await firestore.collection('users').get()
		const notifications: Notification[] = []

		await Promise.all(
			users.map(async user => {
				const notification = await getNotification(user)
				if (notification) notifications.push(...notification)
			})
		)

		await sendNotifications(notifications)
	})
)
