import { expect } from 'chai';

import { Router } from './router';

describe('Router', () => {

	beforeEach(() => {
		Router.go('/sign-up');
	});

	it('should check go method', () => {
		expect(window.location.pathname).to.equal('/sign-up');
	});

	it('should check back method', () => {
		Router.back();
		expect(window.location.pathname).to.equal('/sign-up');
	});
});
