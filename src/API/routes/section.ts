import firebase from 'firebase-admin'
import { Router } from 'express'

import Section from '../../Section'

const router = Router()
const firestore = firebase.firestore()

router.get(
	'/section',
	async ({ query: { deck_id: deckId, section_id: sectionId, limit } }, res) => {
		try {
			if (typeof deckId !== 'string') {
				res.status(400).send('You must send a "deck_id" query parameter')
				return
			}

			if (typeof sectionId === 'string') {
				try {
					res.json((await Section.fromId(sectionId, deckId)).json)
				} catch {
					res.status(404).send('Section not found')
				}
				return
			}

			let query: FirebaseFirestore.Query = firestore.collection(
				`decks/${deckId}/sections`
			)

			if (typeof limit === 'string') {
				const realLimit = parseInt(limit, 10)

				if (isNaN(realLimit) || realLimit < 0) {
					res.status(400).send('Invalid "limit"')
					return
				}

				query = query.limit(realLimit)
			}

			res.json(
				(await query.get()).docs
					.map(snapshot => {
						try {
							return new Section(snapshot).json
						} catch {
							return null
						}
					})
					.filter(Boolean)
			)
		} catch (error) {
			console.error(error)
			res.status(500).send(error.message)
		}
	}
)

export default router
