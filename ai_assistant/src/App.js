"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_svg_1 = __importDefault(require("./assets/react.svg"));
const vite_svg_1 = __importDefault(require("/vite.svg"));
require("./App.css");
const react_2 = __importDefault(require("react"));
function App() {
    const [count, setCount] = (0, react_1.useState)(0);
    return (react_2.default.createElement(react_2.default.Fragment, null,
        react_2.default.createElement("div", null,
            react_2.default.createElement("a", { href: "https://vitejs.dev", target: "_blank" },
                react_2.default.createElement("img", { src: vite_svg_1.default, className: "logo", alt: "Vite logo" })),
            react_2.default.createElement("a", { href: "https://react.dev", target: "_blank" },
                react_2.default.createElement("img", { src: react_svg_1.default, className: "logo react", alt: "React logo" }))),
        react_2.default.createElement("h1", null, "Vite + React"),
        react_2.default.createElement("div", { className: "card" },
            react_2.default.createElement("button", { onClick: () => setCount((count) => count + 1) },
                "count is ",
                count),
            react_2.default.createElement("p", null,
                "Edit ",
                react_2.default.createElement("code", null, "src/App.tsx"),
                " and save to test HMR")),
        react_2.default.createElement("p", { className: "read-the-docs" }, "Click on the Vite and React logos to learn more")));
}
exports.default = App;
