import React from 'react';
import './styles.css';

export default function RightSidebar() {
    return (
        <aside className="right-sidebar">
            <div className="search-bar-container">
                <input type="text" placeholder="Buscar na rede" />
            </div>

            <div className="trending-topics">
                <h3>Assuntos do momento</h3>
                {/* Lógica e lista de assuntos virão aqui */}
            </div>

            <div className="who-to-follow">
                <h3>Quem seguir</h3>
                {/* Lógica e lista de perfis virão aqui */}
            </div>
        </aside>
    );
}