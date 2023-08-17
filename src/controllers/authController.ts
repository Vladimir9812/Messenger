import { AuthAPI } from '@api';
import { SignInRequest, SignUpRequest } from '@models';
import { Store, Router } from '@services';
import { CHATS_PATH, CHATS_REFRESH_TIME, LOGIN_PATH } from '@constants';
import { showServerError } from '@utilities';

import { ChatsController } from './chatsController';

class AuthControllerClass {

	private _interval: ReturnType<typeof setInterval> | null = null;

	signup(data: SignUpRequest): Promise<void> {
		return AuthAPI.signup(data)
			.then(this.getAuthUser.bind(this))
			.then(() => Router.go(CHATS_PATH))
			.catch(showServerError);
	}

	signin(data: SignInRequest): Promise<void> {
		return AuthAPI.signin(data)
			.then(this.getAuthUser.bind(this))
			.then(() => Router.go(CHATS_PATH))
			.catch(showServerError);
	}

	getAuthUser(): Promise<void> {
		return AuthAPI.getAuthUser()
			.then(data => Store.updateState('user', data))
			.then(ChatsController.getAllChats)
			.then(() => {
				this._interval = setInterval(ChatsController.getAllChats, CHATS_REFRESH_TIME);
			})
			.catch(err => {
				showServerError(err);
				Store.updateState('user', null);
			});
	}

	logout(): Promise<void> {
		return AuthAPI.logout()
			.then(() => Store.updateState('user', null))
			.then(() => {
				clearInterval(this._interval as number);
				this._interval = null;
			})
			.then(() => Router.go(LOGIN_PATH))
			.catch(showServerError);
	}
}

export const AuthController = new AuthControllerClass();
