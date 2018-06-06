import {Yogax} from "./js/yogax";
import ReactDOM from "react-dom";
import React from "react";
import "./scss/main.scss";

const wrapper = document.getElementById("yogax");
wrapper ? ReactDOM.render(<Yogax />, wrapper) : false;