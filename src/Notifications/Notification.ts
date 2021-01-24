import firebase from 'firebase-admin'
import chunk from 'lodash/chunk'

type Notification = firebase.messaging.Message

export interface NotificationOptions {
	title: string
	body: string
	icon?: string
	url: string
}

const CHUNK_SIZE = 500
const DEFAULT_ICON = '/images/logos/square.jpg'

const messaging = firebase.messaging()

export const createNotification = (
	token: string,
	{ title, body, icon = DEFAULT_ICON, url }: NotificationOptions
): Notification => ({
	notification: { title, body },
	data: { icon, url },
	token
})

export const createNotifications = (
	tokens: string[],
	options: NotificationOptions
) => tokens.map(token => createNotification(token, options))

export const sendNotifications = async (notifications: Notification[]) => {
	const chunks = chunk(notifications, CHUNK_SIZE)
	await Promise.all(chunks.map(chunk => messaging.sendAll(chunk)))
}

export default Notification
