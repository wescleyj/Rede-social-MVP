import { Link } from 'react-router-dom';
import './styles.css';

export default function NotFound() {
    return (
        <div className="notfound-container">
            <div className="notfound-content">
                <h1 className="notfound-title">404</h1>
                <h2 className="notfound-subtitle">Página não encontrada</h2>
                <p className="notfound-text">
                    O endereço que você tentou acessar não existe ou foi removido.<br />
                    Que tal voltar ao feed e ver o que está rolando?
                </p>
                <Link to="/" className="btn-primary-glow">Voltar ao início</Link>
            </div>
        </div>
    );
}