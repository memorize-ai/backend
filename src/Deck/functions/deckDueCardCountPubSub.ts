import * as functions from 'firebase-functions'
import admin from 'firebase-admin'

import { DECK_DUE_CARD_COUNT_SCHEDULE } from '../../constants'
import Section from '../../Section'
import { cauterize } from '../../utils'

const firestore = admin.firestore()

export default functions.pubsub.schedule(DECK_DUE_CARD_COUNT_SCHEDULE).onRun(
	cauterize(async () => {
		const { docs: users } = await firestore.collection('users').get()

		return Promise.all(
			users.map(async ({ id: uid }) => {
				const { docs: decks } = await firestore
					.collection(`users/${uid}/decks`)
					.get()

				return Promise.all(
					decks.map(userData => updateDueCardCounts(uid, userData))
				)
			})
		)
	})
)

const updateDueCardCounts = async (
	uid: string,
	deckUserData: FirebaseFirestore.DocumentSnapshot
) => {
	const deckId = deckUserData.id

	const dueCards = await getDueCards(uid, deckId)

	const cardCountOfSection = (sectionId: string) =>
		dueCards.reduce(
			(acc, card) => acc + Number(card.get('section') === sectionId),
			0
		)

	return firestore.doc(`users/${uid}/decks/${deckId}`).update({
		dueCardCount: dueCards.length,
		unsectionedDueCardCount: cardCountOfSection(Section.unsectionedId),
		sections: Object.keys(deckUserData.get('sections') ?? {}).reduce(
			(acc: Record<string, number>, sectionId) => {
				acc[sectionId] = cardCountOfSection(sectionId)
				return acc
			},
			{}
		)
	})
}

const getDueCards = async (uid: string, deckId: string) =>
	(
		await firestore
			.collection(`users/${uid}/decks/${deckId}/cards`)
			.where('due', '<=', new Date())
			.get()
	).docs
