import * as functions from 'firebase-functions'

import User from '..'
import { cauterize } from '../../utils'

export default functions.firestore.document('users/{uid}').onDelete(
	cauterize(async snapshot => {
		await Promise.all([new User(snapshot).onDelete(), User.decrementCounter()])
	})
)
