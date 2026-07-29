import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LeftSidebar from '../../components/LeftSidebar';
import RightSidebar from '../../components/RightSidebar';
import { AuthContext } from '../../contexts/AuthContext';
import './styles.css';

// Mocks
const MOCK_CONTACTS = [
    { id: 1, name: "Outra Pessoa", username: "pessoa_2", avatar_url: null, lastMessage: "E aí, tudo bem?" },
    { id: 2, name: "Maria Silva", username: "maria_silva", avatar_url: null, lastMessage: "Haha, concordo." },
];

const MOCK_CHAT_HISTORY = {
    "pessoa_2": [
        { id: 1, sender: "pessoa_2", text: "Olá! Vi seu post hoje.", timestamp: "10:00" },
        { id: 2, sender: "me", text: "Oi! Que legal, o que achou?", timestamp: "10:05" },
        { id: 3, sender: "pessoa_2", text: "E aí, tudo bem?", timestamp: "10:06" }
    ],
    "maria_silva": [
        { id: 1, sender: "maria_silva", text: "Você viu aquela nova feature?", timestamp: "Ontem" },
        { id: 2, sender: "me", text: "Sim! Muito louco.", timestamp: "Ontem" },
        { id: 3, sender: "maria_silva", text: "Haha, concordo.", timestamp: "Ontem" }
    ]
};

export default function Messages() {
    const { userData } = useContext(AuthContext);
    const { username } = useParams();
    const navigate = useNavigate();
    const chatEndRef = useRef(null);

    const [activeContact, setActiveContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        if (username) {
            const contact = MOCK_CONTACTS.find(c => c.username === username);
            if (contact) {
                setActiveContact(contact);
                setMessages(MOCK_CHAT_HISTORY[username] || []);
            } else {
                // Usuário não existe no mock, cria contato temporário
                const tempContact = { id: 999, name: username, username: username, avatar_url: null, lastMessage: "" };
                setActiveContact(tempContact);
                setMessages([]);
            }
        } else {
            setActiveContact(null);
            setMessages([]);
        }
    }, [username]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const msg = {
            id: Date.now(),
            sender: "me",
            text: newMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, msg]);
        setNewMessage("");
    };

    if (!userData) {
        return <div className="layout-wrapper">Carregando...</div>;
    }

    return (
        <div className="layout-wrapper">
            <LeftSidebar />

            <main className="content messages-main">
                <div className="messages-layout">
                    
                    {/* Lista de Contatos */}
                    <aside className="contacts-sidebar">
                        <header className="contacts-header">
                            <h2>Mensagens</h2>
                        </header>
                        <div className="contacts-list">
                            {MOCK_CONTACTS.map(contact => (
                                <div 
                                    key={contact.id} 
                                    className={`contact-card ${activeContact?.username === contact.username ? 'active' : ''}`}
                                    onClick={() => navigate(`/messages/${contact.username}`)}
                                >
                                    <div className="contact-avatar"></div>
                                    <div className="contact-info">
                                        <div className="contact-names">
                                            <strong>{contact.name}</strong>
                                            <span>@{contact.username}</span>
                                        </div>
                                        <p className="contact-last-message">{contact.lastMessage}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* Área do Chat */}
                    <section className="chat-area">
                        {activeContact ? (
                            <>
                                <header className="chat-header">
                                    <div className="chat-contact-info">
                                        <div className="contact-avatar-small"></div>
                                        <div>
                                            <strong>{activeContact.name}</strong>
                                            <span>@{activeContact.username}</span>
                                        </div>
                                    </div>
                                    <button className="btn-secondary" onClick={() => navigate(`/profile/${activeContact.username}`)}>
                                        Ver Perfil
                                    </button>
                                </header>
                                
                                <div className="chat-history">
                                    {messages.length === 0 ? (
                                        <div className="no-messages">Envie uma mensagem para começar a conversa!</div>
                                    ) : (
                                        messages.map(msg => (
                                            <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                                                <div className="chat-bubble">
                                                    <p>{msg.text}</p>
                                                    <span className="chat-timestamp">{msg.timestamp}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <form className="chat-input-area" onSubmit={handleSendMessage}>
                                    <input 
                                        type="text" 
                                        placeholder="Digite uma mensagem..." 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button type="submit" disabled={!newMessage.trim()} className="btn-send-message">
                                        Enviar
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="chat-empty-state">
                                <h3>Selecione uma mensagem</h3>
                                <p>Escolha um contato na lista à esquerda para conversar.</p>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <RightSidebar />
        </div>
    );
}
