export type UserNotificationsType = 'all' | 'fixed' | 'none'
export type FixedUserNotificationsDay = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface FixedUserNotifications {
	days: FixedUserNotificationsDay[]
	time: FixedUserNotificationsTime
}

export interface FixedUserNotificationsTime {
	hours: number
	minutes: number
}

export default interface UserNotifications {
	type: UserNotificationsType
	fixed: FixedUserNotifications
}

export const DEFAULT_USER_NOTIFICATIONS: UserNotifications = {
	type: 'fixed',
	fixed: {
		days: [1, 5],
		time: { hours: 12, minutes: 0 }
	}
}
