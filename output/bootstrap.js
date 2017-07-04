import * as React from 'react';
import render from 'react-dom';
import {AppComponent} from './components/app.component.jsx';
import {store} from './state/store';
import { Provider } from 'react-redux';

// cancel right click
document.onmousedown = (event) => event.button !== 2;

render(
	React.createElement(Provider, {store: store}, 
		React.createElement(AppComponent, null)
	),
	document.getElementById('root')
);