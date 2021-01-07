import sendgrid from '@sendgrid/mail'

import { SENDGRID_API_KEY, SUPPORT_EMAIL } from '../constants'

sendgrid.setApiKey(SENDGRID_API_KEY)

export enum EmailTemplate {
	DueCardsNotification = 'due-cards',
	UserSignUpNotification = 'user-sign-up',
	ContactUser = 'contact-user',
	ReportMessage = 'report-message'
}

export interface EmailUser {
	name: string
	email: string
}

export interface EmailOptions {
	template: EmailTemplate
	to: EmailUser
	from?: EmailUser
	replyTo?: EmailUser
	context?: Record<string, unknown>
}

export const DEFAULT_FROM: EmailUser = {
	name: 'memorize.ai',
	email: SUPPORT_EMAIL
}

export const getTemplateId = (template: EmailTemplate) => {
	switch (template) {
		case EmailTemplate.DueCardsNotification:
			return 'd-8d3445ce4d31446faf1a8dfc19b2824f'
		case EmailTemplate.UserSignUpNotification:
			return 'd-2e7844e1dff14713bbeda01b04d8a342'
		case EmailTemplate.ContactUser:
			return 'd-7020615cbb8046d3891f5c9e5a473398'
		case EmailTemplate.ReportMessage:
			return 'd-c4562aa4cba34c4da72939b47e8ccda0'
	}
}

export const emailOptionsToMessage = ({
	template,
	to,
	from = DEFAULT_FROM,
	replyTo,
	context
}: EmailOptions): sendgrid.MailDataRequired => ({
	templateId: getTemplateId(template),
	to,
	from,
	replyTo,
	dynamicTemplateData: context
})

export const sendEmail = (options: EmailOptions | EmailOptions[]) =>
	sendgrid.send(
		Array.isArray(options)
			? options.map(emailOptionsToMessage)
			: emailOptionsToMessage(options)
	)
