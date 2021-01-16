import * as functions from 'firebase-functions'

import Deck from '..'
import User from '../../User'
import { cauterize } from '../../utils'

export default functions.firestore.document('decks/{deckId}').onDelete(
	cauterize(async snapshot => {
		const deck = new Deck(snapshot)

		await Promise.all([
			deck.deleteIndex(),
			Deck.delete(deck.id),
			Deck.deleteFromStorage(deck.id),
			Deck.decrementCounter(),
			User.decrementCreatedDeckCount(deck.creatorId)
		])
	})
)
