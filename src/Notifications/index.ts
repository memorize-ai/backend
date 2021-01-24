import firebase from 'firebase-admin'

import Notification, { NotificationOptions } from './Notification'
import User from '../User'
import Deck from '../Deck'
import DeckUserData from '../Deck/UserData'
import Section from '../Section'
import {
	FixedUserNotificationsDay,
	FixedUserNotificationsTime
} from '../User/Notifications'

interface PayloadItem {
	deck: Deck
	total: number
	delta: number
}

const MILLISECONDS_IN_MINUTE = 1000 * 60
const MILLISECONDS_IN_HOUR = MILLISECONDS_IN_MINUTE * 60
const MILLISECONDS_IN_DAY = MILLISECONDS_IN_HOUR * 24

const firestore = firebase.firestore()
const deckCache: Record<string, Deck> = {}

const getDeck = async (id: string) =>
	Object.prototype.hasOwnProperty.call(deckCache, id)
		? deckCache[id]
		: (deckCache[id] = await Deck.fromId(id))

const getStartOfDay = (date: Date) => {
	const time = date.getTime()
	const offset = time % MILLISECONDS_IN_DAY
	const timezoneOffset = date.getTimezoneOffset() * MILLISECONDS_IN_MINUTE

	return new Date(time - offset + timezoneOffset)
}

const fixedTimeToMilliseconds = (time: FixedUserNotificationsTime) =>
	time.hours * MILLISECONDS_IN_HOUR + time.minutes * MILLISECONDS_IN_MINUTE

const compareMillisecondsToMinute = (a: number, b: number) =>
	Math.floor(a / MILLISECONDS_IN_MINUTE) ===
	Math.floor(b / MILLISECONDS_IN_MINUTE)

const shouldShowNotification = (user: User) => {
	switch (user.notifications.type) {
		case 'all':
			return true
		case 'fixed': {
			const { days, time } = user.notifications.fixed

			const date = new Date()
			const startOfDay = getStartOfDay(date)

			return (
				days.includes(date.getDay() as FixedUserNotificationsDay) &&
				compareMillisecondsToMinute(
					date.getTime(),
					startOfDay.getTime() + fixedTimeToMilliseconds(time)
				)
			)
		}
		case 'none':
			return false
	}
}

const getNotificationOptions = (
	{ notifications: { type } }: User,
	items: PayloadItem[]
): NotificationOptions | null => {
	if (type === 'none') return null

	const first = items[0]
	const total = items.reduce((acc, { total }) => acc + total, 0)

	if (!(first && total)) return null

	const body = `${total} card${total === 1 ? '' : 's'} in ${first.deck.name}${
		items.length > 1
			? ` and ${items.length - 1} more deck${items.length === 2 ? '' : 's'}`
			: ''
	} ${total === 1 ? 'is' : 'are'} due`

	switch (type) {
		case 'all': {
			const delta = items.reduce((acc, { delta }) => acc + delta, 0)
			if (!delta) return null

			return {
				title: `${delta} card${
					delta === 1 ? ' was' : 's were'
				} just marked due`,
				body,
				url: '/review'
			}
		}
		case 'fixed':
			return {
				title: `${total} card${total === 1 ? ' is' : 's are'} due`,
				body,
				url: '/review'
			}
	}
}

const getNotification = async (
	snapshot: FirebaseFirestore.DocumentSnapshot
): Promise<Notification[] | null> => {
	try {
		const user = new User(snapshot)

		const { docs: decks } = await firestore
			.collection(`users/${user.id}/decks`)
			.get()

		const showNotification = shouldShowNotification(user)
		const rawItems = await Promise.all(
			decks.map(snapshot => onDeck(user, snapshot, showNotification))
		)

		if (!showNotification) return null

		const options = getNotificationOptions(
			user,
			rawItems.filter(Boolean) as PayloadItem[]
		)

		return options && user.notification(options)
	} catch (error) {
		console.error(error)
		return null
	}
}

const onDeck = async (
	user: User,
	snapshot: FirebaseFirestore.DocumentSnapshot,
	showNotification: boolean
): Promise<PayloadItem | null> => {
	try {
		const userData = new DeckUserData(snapshot)
		const ref = firestore.doc(`users/${user.id}/decks/${userData.id}`)

		const { docs: cards } = await ref
			.collection('cards')
			.where('due', '<=', new Date())
			.get()

		for (const sectionId in userData.sections)
			userData.sections[sectionId] = getCardCount(cards, sectionId)

		await ref.update({
			dueCardCount: cards.length,
			unsectionedDueCardCount: getCardCount(cards, Section.unsectionedId),
			sections: userData.sections
		})

		if (!showNotification) return null

		return {
			deck: await getDeck(userData.id),
			total: cards.length,
			delta: cards.length - userData.numberOfDueCards
		}
	} catch (error) {
		console.error(error)
		return null
	}
}

const getCardCount = (
	cards: FirebaseFirestore.DocumentSnapshot[],
	sectionId: string
) =>
	cards.reduce(
		(acc, card) => acc + Number(card.get('section') === sectionId),
		0
	)

export default getNotification
