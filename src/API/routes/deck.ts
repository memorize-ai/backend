import { Router } from 'express'

import Deck from '../../Deck'

const router = Router()

router.get('/deck', async (
	{ query: { id, short_id: shortId } },
	res
) => {
	try {
		switch ('string') {
			case typeof id:
				res.json((await Deck.fromId(id as string)).json)
				break
			case typeof shortId:
				res.json((await Deck.fromSlugId(shortId as string)).json)
				break
			default:
				res.status(400).send('You must pass an "id" or "short_id" as query parameters')
		}
	} catch (error) {
		console.error(error)
		res.status(404).send('Deck does not exist')
	}
})

export default router
