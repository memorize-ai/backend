import * as functions from 'firebase-functions'

import User from '..'
import { cauterize } from '../../utils'

export default functions.firestore.document('users/{uid}').onCreate(
	cauterize(async snapshot => {
		await new User(snapshot).onCreate()
	})
)
