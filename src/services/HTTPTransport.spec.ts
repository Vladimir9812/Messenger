import { expect } from 'chai';

import { HTTPTransport } from './HTTPTransport';

describe('HTTPTransport', () => {
	const http = new HTTPTransport('https://jsonplaceholder.typicode.com/posts');

	it('should check get request', async () => {
		const response = await http.get('/1');
		expect(JSON.parse(response).id).to.equal(1);
	});

	it('should check post request', async () => {
		const data = { title: 'test', body: 'test' };
		const response = await http.post('', {}, data);
		expect(JSON.parse(response).id).to.equal(101);
	});

	it('should check put request', async () => {
		const data = {
			id: 1,
			title: 'foo',
			body: 'bar',
			userId: 1
		};

		const response = await http.put('/1', {}, data);
		expect(JSON.parse(response).id).to.equal(1);
	});

	it('should check delete request', async () => {
		const response = await http.delete('/1');
		expect(JSON.parse(response).id).to.equal(undefined);
	});
});
