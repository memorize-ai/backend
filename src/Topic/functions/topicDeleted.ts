import * as functions from 'firebase-functions'
import firebase from 'firebase-admin'

import { cauterize } from '../../utils'

const storage = firebase.storage().bucket()

export default functions.firestore
	.document('topics/{topicId}')
	.onDelete(
		cauterize((_snapshot, { params: { topicId } }) =>
			storage.file(`topics/${topicId}`).delete()
		)
	)
