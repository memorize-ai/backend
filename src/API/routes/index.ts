import { Router } from 'express'

import card from './card'
import deck from './deck'
import section from './section'
import topic from './topic'
import user from './user'

const router = Router()

router.use(card)
router.use(deck)
router.use(section)
router.use(topic)
router.use(user)

export default router
