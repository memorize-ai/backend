import * as functions from 'firebase-functions'

import User from '..'
import { cauterize } from '../../utils'

export default functions.firestore.document('users/{uid}').onUpdate(
	cauterize(async snapshot => {
		const before = new User(snapshot.before)
		const after = new User(snapshot.after)

		const didImageChange = before.hasImage !== after.hasImage
		const didNameChange = before.name !== after.name

		const promises: Promise<unknown>[] = []

		if (didNameChange) promises.push(after.normalizeDisplayName())

		if (didImageChange || didNameChange)
			promises.push(after.indexCreatedDecks())

		await Promise.all(promises)
	})
)
