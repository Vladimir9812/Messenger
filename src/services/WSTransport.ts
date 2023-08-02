import { EventBus } from './eventBus';

export enum WSEvents {
	OPEN = 'open',
	MESSAGE = 'message',
	ERROR = 'error',
	CLOSE = 'close'
}

export enum WSStatus {
	CONNECTING = 'connecting',
  OPEN = 'open',
  CLOSING = 'closing',
  CLOSED = 'closed'
}

const WSStatuses = [WSStatus.CONNECTING, WSStatus.OPEN, WSStatus.CLOSING, WSStatus.CLOSED];

export class WSTransport extends EventBus {

	private _socket?: WebSocket;
	private readonly _baseUrl: string;

	private _pingIntervalTime = 30000;
	private _pingInterval?: ReturnType<typeof setInterval>;

	get status(): WSStatus | never {
		if (!this._socket) {
			throw new Error('Socket is not connected');
		}

		return WSStatuses[this._socket.readyState];
	}

	constructor(url: string) {
		super();

		this._baseUrl = url;
	}

	send(data: string | number | Record<string, any>) {
		if (!this._socket) {
			throw new Error('Socket is not connected');
		}

		this._socket.send(JSON.stringify(data));
	}

	connect() {
		if (this._socket) {
			throw new Error('The socket is already connected');
		}

		this._socket = new WebSocket(this._baseUrl);

		this._subscribe();
		this._setupPing();
	}

	close() {
		this._socket?.close();
	}

	private _setupPing() {
		this._pingInterval = setInterval(() => {
			this.send({ type: 'ping' });
		}, this._pingIntervalTime);

		this.on(WSEvents.CLOSE, () => {
			clearInterval(this._pingInterval);
			this._pingInterval = undefined;
			this._socket = undefined;
		});
	}

	private _subscribe() {
		this._socket?.addEventListener('open', () => {
			this.emit(WSEvents.OPEN);
		});

		this._socket?.addEventListener('close', () => {
			this.emit(WSEvents.CLOSE);
		});

		this._socket?.addEventListener('error', e => {
			this.emit(WSEvents.ERROR, e);
		});

		this._socket?.addEventListener('message', message => {
			try {
				const data = JSON.parse(message.data);

				if (['pong', 'user connected'].includes(data.type)) {
					return;
				}

				if (data.type === 'error') {
					this.emit(WSEvents.ERROR, data.content);
				} else {
					this.emit(WSEvents.MESSAGE, data);
				}
			} catch (e) {
				// игнорируем ошибки парсинга JSON
			}
		});
	}
}
