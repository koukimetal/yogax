import ReactDOM from "react-dom";
import React from "react";
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import rootReducer from './js/redux/reducers';
import App from './js/App';
import "./scss/main.scss";

const store = createStore(rootReducer);
ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('yogax')
);
