import * as admin from 'firebase-admin'
import { Express } from 'express'
import { v4 as uuid } from 'uuid'

import { PRIVATE_API_PREFIX } from '../../constants'
import { storageUrl } from '../../utils'

const PATH = `/${PRIVATE_API_PREFIX}/upload-deck-asset`

const firestore = admin.firestore()
const storage = admin.storage().bucket()

export interface UploadDeckAssetRequest {
	query: {
		user: string
		deck: string
	}
	body: string
}

export default (app: Express) => {
	app.post(PATH, async (
		{ query: { user: uid, deck: deckId }, body: rawDataString }: UploadDeckAssetRequest,
		res
	) => {
		const sendError = (message: string) => {
			res.json({
				error: { message }
			})
		}
		
		if (!(typeof uid === 'string' && typeof deckId === 'string'))
			return sendError('Invalid query parameters. Required: "user", "deck"')
		
		if (typeof rawDataString !== 'string')
			return sendError('You must send a base64 encoded string as a body')
		
		const contentTypeMatch = rawDataString.match(/^data\:(.+?);base64,/)
		
		if (!contentTypeMatch)
			return sendError('Invalid image data')
		
		const token = uuid()
		const { id } = firestore.collection('deck-assets').doc()
		
		try {
			await storage
				.file(`deck-assets/${deckId}/${id}`)
				.save(new Buffer(rawDataString.replace(contentTypeMatch[0], ''), 'base64'), {
					public: true,
					metadata: {
						contentType: contentTypeMatch[1],
						metadata: {
							firebaseStorageDownloadTokens: token,
							owner: uid
						}
					}
				})
			
			res.json({
				url: storageUrl(['deck-assets', deckId, id], token)
			})
		} catch (error) {
			res.json({ error })
		}
	})
}
