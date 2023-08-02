import { Block } from '@services';
import { emitModalClick, requiredValidator } from '@utilities';
import { ChatsController } from '@controllers';

import { Fieldset } from '../../../fieldset/fieldset';
import { UserSearcher } from '../../../userSearcher/userSearcher';
import { Button } from '../../../button/button';

import CreateChatTemplate from './createChat.hbs';

import './createChat.css';


interface SuperProps {
	titleFieldset: Fieldset;
	userSearcher: UserSearcher;
	createButton: Button;
}

export class CreateChat extends Block<SuperProps> {

	fetching = false;

	constructor() {
		const superProps: SuperProps = {
			titleFieldset: new Fieldset({
				name: 'title',
				label: 'Название',
				value: '',
				validators: [requiredValidator]
			}),
			userSearcher: new UserSearcher(),
			createButton: new Button({
				text: 'Создать',
				onClick: () => this.createChat()
			})
		};

		super('div', 'create-chat', superProps);
	}

	show() {
		this.element.style.display = 'flex';
	}

	createChat() {
		if (this.fetching) {
			return;
		}

		const title = this.props.titleFieldset.getValue();
		const usersToAdd = this.props.userSearcher.selectedUsers;

		this.fetching = true;

		ChatsController.createChat(title, usersToAdd).then(emitModalClick(this.element));
	}

	render(): DocumentFragment {
		return this.compile(CreateChatTemplate);
	}
}
