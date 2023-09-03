import { isEmpty } from '../utils/isEmpty';

enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

type RequestHeaders = Record<string, string>;
type RequestData = Record<string, any>;

type HTTPMethod = <T = any>(url: string, headers?: RequestHeaders, data?: RequestData) => Promise<T>;

function queryStringify(data: Record<string, any>) {
  return Object.entries(data).reduce((acc, [key, value], index) => {
    const connector = index === 0 ? '' : '&';
    return acc.concat(`${connector}${key}=${value.toString()}`);
  }, '?');
}

export class HTTPTransport {

	private readonly _baseUrl: string;

	constructor(url: string) {
		this._baseUrl = url;
	}

  get: HTTPMethod = (url, headers?, data?) => {
    if (!isEmpty(data)) {
      url += queryStringify(data!);
    }

    return this.request(url, Method.GET, headers, data);
  };

  post: HTTPMethod = (url, headers?, data?) => {
    return this.request(url, Method.POST, headers, data);
  };

	put: HTTPMethod = (url, headers?, data?) => {
		return this.request(url, Method.PUT, headers, data);
	};

	delete: HTTPMethod = (url, headers?, data?) => {
		return this.request(url, Method.DELETE, headers, data);
	};

  private request(
		url: string,
		method: Method,
		headers: RequestHeaders = {},
		data: RequestData = {}
	): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, `${this._baseUrl}${url}`);

      xhr.timeout = 60000;
			xhr.withCredentials = true;
			xhr.responseType = 'json';

      Object.keys(headers).forEach(key => {
        xhr.setRequestHeader(key, headers[key]);
      });

      xhr.onload = () => {
				const status = xhr.status || 0;

				if (status >= 200 && status < 300) {
					resolve(xhr.response || xhr.responseText);
				} else {
					const message = {
						'0': 'Abort',
						'100': 'Information',
						'200': 'Ok',
						'300': 'Redirect failed',
						'400': 'Access error',
						'500': 'Internal server error'
					}[Math.floor((status / 100) * 100)];

					const reason = xhr.response.reason || message;

					reject({ status, reason });
				}
			};

      xhr.onabort = () => reject({ reason: 'Abort' });
      xhr.onerror = () => reject({ reason: 'Network error' });
      xhr.ontimeout = () => reject({ reason: 'Timeout' });

      if (method === Method.GET || isEmpty(data)) {
        xhr.send();
      } else if (data instanceof FormData) {
				xhr.send(data);
			} else {
				xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
      }
    });
  }
}
