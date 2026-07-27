import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './styles.css';

export default function RightSidebar() {
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e.key === 'Enter' && search.trim() !== '') {
            navigate(`/pesquisa?q=${encodeURIComponent(search)}`);
        }
    };

    return (
        <aside className="right-sidebar">
            <div className="search-bar-container">
                <input
                    type="text"
                    placeholder="Buscar na rede"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearch}
                />            </div>

            <div className="who-to-follow">
                <h3>Quem seguir</h3>
                {/* Logica para mostrar perfils aleatorios */}
            </div>
        </aside>
    );
}