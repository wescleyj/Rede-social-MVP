import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignIn from './pages/Sign_in';
import SignUp from './pages/Sign_up';
import Home from './pages/Home';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import {RotaPublica, RotaPrivada} from "../services/routes.jsx";
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<RotaPublica><Home /></RotaPublica>} />
                <Route path="/signin" element={<RotaPublica><SignIn /></RotaPublica>} />
                <Route path="/signup" element={<RotaPublica><SignUp /></RotaPublica>} />
                <Route path="/profile" element={<RotaPrivada><Profile /></RotaPrivada>} />

                {/* Rota curinga para capturar qualquer caminho não listado acima */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);Publica