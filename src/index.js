import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getPerformance } from "firebase/performance";
import { React, StrictMode } from "react";
import { render } from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./components/home";
import { App } from "./components/app";

const firebaseConfig = {
    apiKey: "AIzaSyCY9lI-qta88G-HfNmTtSSevSlzo2Mnb7Y",
    authDomain: "jewel-6b5c6.firebaseapp.com",
    projectId: "jewel-6b5c6",
    storageBucket: "jewel-6b5c6.appspot.com",
    messagingSenderId: "646269657574",
    appId: "1:646269657574:web:89f12ab9eea42dd7d6b627",
    measurementId: "G-4JZ5WSGG54"
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);
getPerformance(app);

const Root = () => {
    return (
        <StrictMode>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={ <Home /> }/>
                    <Route path="/app" element={ <App /> } />
                </Routes>
            </BrowserRouter>
        </StrictMode>
    );
};

render(<Root />, document.getElementById("root"));