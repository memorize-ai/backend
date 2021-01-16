import * as functions from 'firebase-functions'

import Deck from '..'
import User from '../../User'
import { cauterize } from '../../utils'

export default functions.firestore.document('decks/{deckId}').onCreate(
	cauterize(async snapshot => {
		const deck = new Deck(snapshot)

		await Promise.all([
			deck.index(),
			deck.initializeNextPostedCard(),
			Deck.incrementCounter(),
			User.incrementCreatedDeckCount(deck.creatorId)
		])
	})
)
