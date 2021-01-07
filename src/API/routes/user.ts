import { Router } from 'express'

import User from '../../User'

const router = Router()

router.get('/user', async ({ query: { id } }, res) => {
	try {
		typeof id === 'string'
			? res.json((await User.fromId(id)).json)
			: res.status(400).send('You must pass the user\'s "id" as a query parameter')
	} catch (error) {
		console.error(error)
		res.status(404).send('User does not exist')
	}
})

export default router
