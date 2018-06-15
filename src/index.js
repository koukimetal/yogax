import {Yogax} from "./js/yogax";
import ReactDOM from "react-dom";
import React from "react";

import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './js/redux/reducers';
import App from './js/redux/App';
import "./scss/main.scss";
// const wrapper = document.getElementById("yogax");
// wrapper ? ReactDOM.render(<Yogax />, wrapper) : false;
const store = createStore(rootReducer);
ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('yogax')
);
