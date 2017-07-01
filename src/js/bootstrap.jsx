import * as React from 'react';
import render from 'react-dom';
import {AppComponent} from './components/app.component.jsx';
import {store} from './state/store';
import { Provider } from 'react-redux';

// cancel right click
document.onmousedown = (event) => event.button !== 2;

render(
	<Provider store={store}>
		<AppComponent />
	</Provider>,
	document.getElementById('root')
);