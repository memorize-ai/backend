import admin from 'firebase-admin'

import Section from '../Section'
import Algorithm from '../Algorithm'

const firestore = admin.firestore()

export default class CardUserData {
	isNew: boolean
	sectionId: string | null
	due: Date
	totalNumberOfRecallAttempts: number
	numberOfForgotRecallAttempts: number
	numberOfStruggledRecallAttempts: number
	numberOfEasyRecallAttempts: number
	streak: number
	e: number
	isMastered: boolean
	last: {
		id: string
		date: Date
		next: Date
	} | null

	constructor(snapshot?: FirebaseFirestore.DocumentSnapshot) {
		this.isNew = snapshot?.get('new') ?? true
		this.sectionId = snapshot?.get('section') ?? null
		this.due = snapshot?.get('due')?.toDate() ?? new Date()
		this.totalNumberOfRecallAttempts = snapshot?.get('totalCount') ?? 0
		this.numberOfForgotRecallAttempts = snapshot?.get('forgotCount') ?? 0
		this.numberOfStruggledRecallAttempts = snapshot?.get('struggledCount') ?? 0
		this.numberOfEasyRecallAttempts = snapshot?.get('easyCount') ?? 0
		this.streak = snapshot?.get('streak') ?? 0
		this.e = snapshot?.get('e') ?? Algorithm.DEFAULT_E
		this.isMastered = snapshot?.get('mastered') ?? false

		const last = snapshot?.get('last') ?? null

		this.last = last && {
			id: last.id,
			date: last.date?.toDate(),
			next: last.next?.toDate()
		}
	}

	static fromId = async (uid: string, deckId: string, cardId: string) =>
		new CardUserData(
			await firestore.doc(`users/${uid}/decks/${deckId}/cards/${cardId}`).get()
		)

	get isDue() {
		return this.due.getTime() <= Date.now()
	}

	get isUnsectioned() {
		return this.sectionId === Section.unsectionedId
	}
}
