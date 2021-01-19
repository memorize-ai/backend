import firebase from 'firebase-admin'

const { FieldValue } = firebase.firestore
const firestore = firebase.firestore()

export const modifyCounter = (increment: number) =>
	firestore.doc('counters/messages').update({
		value: FieldValue.increment(increment)
	})
