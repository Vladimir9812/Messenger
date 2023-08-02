import { APP_ID } from '@constants';
import { AuthUser } from '@utilities';

import { Store } from '../store';

import { ConstructableBlock, Route } from './route';

class RouterClass {

  routes: Route[] = [];
  history: History = window.history;

  private _currentRoute: Route | null = null;

  constructor(public readonly rootId: string) {
		window.onpopstate = (e: PopStateEvent) => {
			this._onRoute((e.currentTarget as Window).location.pathname);
		};

		this._onRoute(window.location.pathname);
  }

  use(pathname: string, block: ConstructableBlock, auth: boolean) {
    const route = new Route(pathname, block, auth, this.rootId);
    this.routes.push(route);

    return this;
  }

	go(pathname: string) {
		this.history.pushState({}, '', pathname);
		this._onRoute(pathname);
	}

	back() {
		this.history.back();
	}

	forward() {
		this.history.forward();
	}

	getRoute(pathname: string): Route | undefined {
		const pathWithoutQuery = pathname.split('?')[0];

		const existRoute = this.routes.find(route => route.pathname === pathWithoutQuery);
		const notFoundRoute = this.routes.find(route => route.pathname === '**');

		if (existRoute) {
			const isUserAuth = !!Store.getState(AuthUser);
			return existRoute.auth === isUserAuth ? existRoute : notFoundRoute;
		}

		return notFoundRoute;
	}

	private _onRoute(pathname: string) {
		const route = this.getRoute(pathname);

		if (!route) {
			return;
		}

		if (this._currentRoute) {
			this._currentRoute.leave();
		}

		this._currentRoute = route;

		route.render();
	}
}

export const Router = new RouterClass(APP_ID);
