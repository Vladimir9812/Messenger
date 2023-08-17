import { Block, Store } from '@services';
import { Button, Checkbox, Fieldset } from '@components';
import { UserResponse } from '@models';
import { isEnterEvent, SelectedChatUsers } from '@utilities';
import { UserController } from '@controllers';

import UserSearcherTemplate from './userSearcher.hbs';
import './userSearcher.css';

interface SuperProps {
	searchFieldset: Fieldset;
	searchButton: Button;
	users: Checkbox[];
}

export class UserSearcher extends Block<SuperProps> {

	selectedUsers: UserResponse[] = [];
	searchedValue: string = '';

	constructor() {
		const superProps: SuperProps = {
			searchFieldset: new Fieldset({
				name: 'login',
				label: 'Логин',
				value: '',
				onKeyUp: e => isEnterEvent(e) && this.searchUsers()
			}),
			searchButton: new Button({
				rounded: true,
				imgSrc: 'icons/arrow-right.svg',
				imgSize: 10,
				onClick: () => this.searchUsers()
			}),
			users: []
		};

		super('div', 'user-searcher', superProps);
	}

	searchUsers() {
		const login = this.props.searchFieldset.getValue();

		if (!login || login === this.searchedValue) {
			return;
		}

		const currentChatUsers = Store.getState(SelectedChatUsers);

		UserController.findUsersByLogin({ login })
			.then(resp => {
				const users = resp
					.filter(user => !currentChatUsers?.find(({ id }) => id === user.id))
					.map(user => new Checkbox({
						text: user.login,
						checked: !!this.selectedUsers.find(({ id }) => id === user.id),
						onChecked: () => this.selectedUsers.push(user),
						onUnChecked: () => this.selectedUsers = this.selectedUsers.filter(({ id }) => id !== user.id)
					}));

				this.searchedValue = login;
				this.setProps({ users });
			});
	}

	resetState() {
		super.resetState();
		this.selectedUsers = [];
	}

	render(): DocumentFragment {
		return this.compile(UserSearcherTemplate);
	}
}
