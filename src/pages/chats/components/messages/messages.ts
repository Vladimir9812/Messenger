import {
	ActionList, AddUser, ArrowLink, Avatar, Button, ChangeAvatar, Input, Modal, Popup, RemoveUser
} from '@components';
import { ConnectBlock, Notifier, Store, WSEvents, WSStatus, WSTransport } from '@services';
import { CHATS_PATH, WS_PATH } from '@constants';
import { ChatsController } from '@controllers';
import {
	AuthUser, Chats, isEnterEvent, SelectedChatInfo, SelectedChatUsers
} from '@utilities';
import { ChatMessageResponse, ChatsResponse, ChatTokenResponse } from '@models';

import { Message } from '../message/message';

import MessagesTemplate from './messages.hbs';
import './messages.css';

interface Props {
  chat: ChatsResponse;
}

interface SuperProps extends Props {
  messages: Message[];
  backLink: ArrowLink;
  chatAvatar: Avatar;
	menuButton: Button;
  messageInput: Input;
  sendButton: Button;
}

export class Messages extends ConnectBlock<SuperProps> {

	changingAvatar = false;

	addUserModal = new Modal({ content: new AddUser() });
	removeUserModal = new Modal({ content: new RemoveUser() });
	changeChatAvatarModal = new Modal({
		content: new ChangeAvatar( { onSaveFile: this.changedChatAvatar.bind(this) })
	});

	actionsPopup = new Popup({
		content: new ActionList({
			items: [
				new Button({
					text: 'Добавить пользователей',
					imgSrc: 'icons/add-user.svg',
					imgSize: 20,
					noStyles: true,
					onClick: () => this.addUserModal.show()
				}),
				new Button({
					text: 'Удалить пользователей',
					imgSrc: 'icons/remove-user.svg',
					imgSize: 20,
					noStyles: true,
					onClick: () => this.removeUserModal.show()
				}),
				new Button({
					text: 'Удалить чат',
					danger: true,
					noStyles: true,
					onClick: this.deleteChat.bind(this)
				})
			]
		}),
		align: 'end'
	});

	private _socketClient: WSTransport | null = null;

	get chat(): ChatsResponse {
		return this.props.chat;
	}

  constructor(props: Props) {
    const superProps: SuperProps = {
      ...props,
      messages: [],
      backLink: new ArrowLink({ attr: { href: CHATS_PATH }, reversed: true }),
			chatAvatar: new Avatar({
				imgSrc: props.chat.avatar,
				mode: 'small',
				hover: true,
				onClick: () => this.changeChatAvatarModal.show()
			}),
			menuButton: new Button({
				imgSrc: 'icons/menu.svg',
				imgSize: 16,
				noStyles: true,
				onClick: e => this.actionsPopup.attach(e)
			}),
      messageInput: new Input({
        attr: {
          name: 'message',
          value: '',
          placeholder: 'Сообщение'
        },
				onKeyUp: e => isEnterEvent(e) && this.sendMessage()
			}),
      sendButton: new Button({
        imgSrc: 'icons/arrow-right.svg',
        rounded: true,
				onClick: () => this.sendMessage()
      })
    };

    super('div', 'messages', superProps, SelectedChatInfo);

		ChatsController.getChatUsers(this.chat.id);
		ChatsController.getChatToken(this.chat.id).then(this._initWSClient.bind(this));
  }

	private _initWSClient({ token }: ChatTokenResponse) {
		if (!token) {
			return;
		}

		const authUser = Store.getState(AuthUser)!;

		this._socketClient = new WSTransport(`${WS_PATH}/${authUser.id}/${this.chat.id}/${token}`);
		this._socketClient.connect();

		this._socketClient.on(WSEvents.OPEN, () => this._socketClient?.send({ content: '0', type: 'get old' }));
		this._socketClient.on(WSEvents.MESSAGE, this._updateMessages.bind(this));
		this._socketClient.on(WSEvents.ERROR, message => Notifier.error(message));
	}

	private _updateMessages(data: ChatMessageResponse | ChatMessageResponse[]) {
		const messages = this.props.messages;
		const newMessages = Array.isArray(data) ? data.reverse() : [data];

		this.setProps({
			messages: [...messages, ...newMessages.map(message => new Message({ message }))]
		});

		const chatUsers = Store.getState(SelectedChatUsers);

		if (!chatUsers || Array.isArray(data)) {
			return;
		}

		const chats = Store.getState(Chats).map(chat => {
			if (chat.id !== this.chat.id) {
				return chat;
			}

			return {
				...chat,
				last_message: {
					user: chatUsers.find(user => user.id === data.user_id),
					time: data.time,
					content: data.content
				}
			};
		});

		Store.updateState('chats', chats);
	}

	onStoreUpdated(chat: ChatsResponse) {
		if (!chat) {
			return;
		}

		this.setProps({ chat });
		this.props.chatAvatar.setProps({ imgSrc: chat.avatar });
	}

	changedChatAvatar(file: File) {
		if (this.changingAvatar) {
			return;
		}

		const data = new FormData();
		data.append('chatId', this.chat.id.toString());
		data.append('avatar', file);

		this.changingAvatar = true;

		ChatsController.changeChatAvatar(data)
			.then(() => {
				this.changingAvatar = false;
				this.changeChatAvatarModal.hide();
			});
	}

	sendMessage() {
		const message = this.props.messageInput.getValue();

		if (!message || this._socketClient?.status !== WSStatus.OPEN) {
			return;
		}

		this._socketClient.send({ content: message, type: 'message' });
		this.props.messageInput.setValue('');
	}

	deleteChat() {
		ChatsController.deleteChat({ chatId: this.chat.id });
	}

	componentWillUnmount() {
		super.componentWillUnmount();
		[
			this.addUserModal,
			this.removeUserModal,
			this.changeChatAvatarModal,
			this.actionsPopup
		].forEach(comp => comp.componentWillUnmount());

		this._socketClient && this._socketClient.close();
	}

	render(): DocumentFragment {
    return this.compile(MessagesTemplate, { chatName: this.chat.title });
  }
}
