import {FormContainer} from "./js/main";
import ReactDOM from "react-dom";
import React from "react";
import "./scss/main.scss";

const wrapper = document.getElementById("create-article-form");
wrapper ? ReactDOM.render(<FormContainer />, wrapper) : false;