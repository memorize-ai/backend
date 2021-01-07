import { Router } from 'express'

import Topic from '../../Topic'

const router = Router()

router.get('/topic', async ({ query: { id, name, category } }, res) => {
	try {
		switch ('string') {
			case typeof id:
				res.json((await Topic.fromId(id as string)).json)
				break
			case typeof name:
				res.json((await Topic.fromName(name as string)).json)
				break
			case typeof category:
				res.json(
					(await Topic.fromCategory(category as string))
						.map(({ json }) => json)
				)
				break
			default:
				res.json((await Topic.all()).map(({ json }) => json))
		}
	} catch (error) {
		console.error(error)
		res.status(404).send('Topic does not exist')
	}
})

export default router
