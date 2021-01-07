import functions from 'firebase-functions'
import admin from 'firebase-admin'

import User from '../../User'
import Deck from '../../Deck'
import { URL_REGEX } from '..'
import { ADMIN_KEY, SUPPORT_ID } from '../../constants'

const firestore = admin.firestore()

export default functions.https.onRequest(
	async ({ method, headers, body }, res) => {
		try {
			res.header('Access-Control-Allow-Origin', '*')
			res.header('Access-Control-Allow-Methods', ['OPTIONS', 'POST'])
			res.header('Access-Control-Allow-Headers', [
				'Authorization',
				'Content-Type'
			])

			if (method === 'OPTIONS') {
				res.send()
				return
			}

			if (method !== 'POST') {
				res.status(400).send('Invalid method')
				return
			}

			if (headers.authorization !== `Bearer ${ADMIN_KEY}`) {
				res.status(401).send('Incorrect admin key')
				return
			}

			if (headers['content-type'] !== 'application/json') {
				res.status(400).send('Must have Content-Type application/json')
				return
			}

			if (typeof body !== 'object') {
				res.status(400).send('Invalid request body')
				return
			}

			const { email, url } = body

			if (!(typeof email === 'string' && typeof url === 'string')) {
				res.status(400).send('You must send an "email" and "url" as strings')
				return
			}

			const slugId = url.match(URL_REGEX)?.[1]

			if (!slugId) {
				res.status(400).send('Invalid deck URL')
				return
			}

			const [deck, user] = await Promise.all([
				Deck.fromSlugId(slugId).catch(() => {
					throw new Error('There are no decks with the specified URL')
				}),
				User.fromEmail(email).catch(() => {
					throw new Error('There are no users with the specified email')
				})
			])

			if (deck.creatorId !== SUPPORT_ID) {
				res
					.status(401)
					.send(
						'You can only transfer decks that were created by the official memorize.ai account'
					)
				return
			}

			await firestore.doc(`decks/${deck.id}`).update({
				creator: user.id
			})

			res.send(`Successfully transferred "${deck.name}" to "${user.name}"`)
		} catch (error) {
			res.status(404).send(error.message)
		}
	}
)
