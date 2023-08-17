import { Block, Store } from '@services';
import { emitModalClick, AuthUser, SelectedChatId, SelectedChatUsers } from '@utilities';
import { ChatsController } from '@controllers';
import { ChatUserResponse } from '@models';

import { Button } from '../../../button/button';
import { Checkbox } from '../../../checkbox/checkbox';
import { Error } from '../../../error/error';

import RemoveUserTemplate from './removeUser.hbs';
import './removeUser.css';

interface SuperProps {
	title: string;
	checkboxes: Checkbox[];
	deleteButton: Button;
	noUsersError: Error | null;
}

export class RemoveUser extends Block<SuperProps> {

	chatId = Store.getState(SelectedChatId)!;
	selectedUsers: ChatUserResponse[] = [];

	fetching = false;

	constructor() {
		const superProps: SuperProps = {
			title: 'Удалить пользователей',
			checkboxes: [],
			deleteButton: new Button({
				text: 'Удалить',
				onClick: () => this.removeUsers()
			}),
			noUsersError: null
		};

		super('div', 'remove-user', superProps);
	}

	removeUsers() {
		if (this.fetching) {
			return;
		}

		if (!this.selectedUsers.length) {
			this.setProps({ noUsersError: new Error({ text: 'Необходимо выбрать пользователей' })});
			return;
		}

		this.fetching = true;

		ChatsController.deleteUsersFromChat(this.selectedUsers, this.chatId)
			.then(emitModalClick(this.element));
	}

	resetState() {
		this.fetching = false;
		this.selectedUsers = [];
	}

	show() {
		this.element.style.display = 'flex';

		const chatUsers = (Store.getState(SelectedChatUsers) || []) as ChatUserResponse[];
		const currentUser = Store.getState(AuthUser);

		const checkboxes = chatUsers
			.filter(user => user.id !== currentUser!.id && user.role !== 'admin')
			.map(user => new Checkbox({
				text: user.login,
				onChecked: () => this.selectedUsers.push(user),
				onUnChecked: () => this.selectedUsers = this.selectedUsers.filter(({ id }) => id !== user.id)
			}));

		this.setProps({ checkboxes });
	}

	render(): DocumentFragment {
		return this.compile(RemoveUserTemplate, {
			title: this.props.title,
			noUsersError: this.props.noUsersError
		});
	}
}
