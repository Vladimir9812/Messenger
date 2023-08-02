import { Button, Fieldset, Link } from '@components';
import { SETTINGS_PATH } from '@constants';
import { AuthController } from '@controllers';
import { FormField, FormData, FormBlock } from '@models';

import ProfileFormTemplate from './form.hbs';
import './form.css';

interface Props<T> {
	fields: FormField[];
	isMainState: boolean;

	onSendData(formData: T): void;
}

interface SuperProps<T> extends Omit<Props<T>, 'fields'> {
	fields: Fieldset[];
	saveButton: Button;
	changeLink: Link;
	passwordLink: Link;
	exitButton: Button;

	onSubmit(e: SubmitEvent): void;
}

export class ProfileForm<T extends FormData<T> = Record<string, any>> extends FormBlock<SuperProps<T>, T> {

	constructor(props: Props<T>) {
		const superProps: SuperProps<T> = {
			...props,
			fields: props.fields.map(field => new Fieldset(field)),
			saveButton: new Button({
				attr: { type: 'submit' },
				className: 'profile-form__save-btn',
				text: 'Сохранить'
			}),
			changeLink: new Link({
				attr: { href: `${SETTINGS_PATH}?state=edit` },
				text: 'Изменить данные'
			}),
			passwordLink: new Link({
				attr: { href: `${SETTINGS_PATH}?state=password` },
				text: 'Изменить пароль'
			}),
			exitButton: new Button({
				attr: { type: 'button' },
				className: 'profile-form__exit-btn',
				text: 'Выйти',
				noStyles: true,
				onClick: () => AuthController.logout()
			}),
			onSubmit: e => this.onSubmit(e)
		};

		super('form', 'profile-form', superProps);
	}

	render(): DocumentFragment {
		return this.compile(ProfileFormTemplate, { isMainState: this.props.isMainState });
	}
}
