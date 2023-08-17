import { Block, Store } from '@services';
import { emitModalClick, SelectedChatId } from '@utilities';
import { ChatsController } from '@controllers';
import { UserResponse } from '@models';

import { Button } from '../../../button/button';
import { Error } from '../../../error/error';
import { UserSearcher } from '../../../userSearcher/userSearcher';

import AddUserTemplate from './addUser.hbs';
import './addUser.css';

interface SuperProps {
	title: string;
	userSearcher: UserSearcher;
	saveButton: Button;
	noUsersError: Error | null;
}

export class AddUser extends Block<SuperProps> {

	chatId = Store.getState(SelectedChatId)!;

	fetching = false;

	get selectedUsers(): UserResponse[] {
		return this.props.userSearcher.selectedUsers;
	}

	constructor() {
		const superProps: SuperProps = {
			title: 'Добавить пользователей',
			userSearcher: new UserSearcher(),
			saveButton: new Button({
				text: 'Добавить',
				className: 'add-user__add-btn',
				onClick: () => this.addUsers()
			}),
			noUsersError: null
		};

		super('div', 'add-user', superProps);
	}

	addUsers() {
		if (this.fetching) {
			return;
		}

		if (!this.selectedUsers.length) {
			this.setProps({ noUsersError: new Error({ text: 'Необходимо выбрать пользователей' })});
			return;
		}

		this.fetching = true;

		ChatsController.addUsersForChat(this.selectedUsers, this.chatId)
			.then(emitModalClick(this.element));
	}

	resetState() {
		super.resetState();
		this.fetching = false;
	}

	show() {
		this.element.style.display = 'flex';
	}

	render(): DocumentFragment {
		return this.compile(AddUserTemplate, {
			title: this.props.title,
			noUsersError: this.props.noUsersError
		});
	}
}
