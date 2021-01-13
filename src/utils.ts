import { https } from 'firebase-functions'

import {
	PING_KEY,
	DEFAULT_STORAGE_BUCKET,
	MILLISECONDS_IN_DAY
} from './constants'

export type HttpsCallableFunction<T> = (
	data: any, // eslint-disable-line
	context: https.CallableContext
) => Promise<T>

export const getDay = () => Math.floor(Date.now() / MILLISECONDS_IN_DAY)

export const cauterize = <Args extends unknown[], Result, Fallback>(
	fn: (...args: Args) => Result,
	fallback?: Fallback
) => (...args: Args) => {
	try {
		return fn(...args)
	} catch (error) {
		console.error(error)
		return fallback ?? Promise.resolve()
	}
}

export const pingable = <T>(
	fn: HttpsCallableFunction<T>
): HttpsCallableFunction<T | void> => (data, context) =>
	data === PING_KEY
		? Promise.resolve() // Do nothing
		: fn(data, context)

export const storageUrl = (pathComponents: string[], token?: string) =>
	`https://firebasestorage.googleapis.com/v0/b/${DEFAULT_STORAGE_BUCKET}/o/${pathComponents.join(
		'%2F'
	)}?alt=media${token ? `&token=${token}` : ''}`

export const slugify = (string: string, delimiter = '-') =>
	string
		.replace(/[\s\:\/\?#@\[\]\-_!\$&'\(\)\*\+\.\,;=]+/g, ' ') // eslint-disable-line
		.trim()
		.replace(/\s+/g, delimiter)
		.toLowerCase() || delimiter.repeat(string.length)
