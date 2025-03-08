import React from 'react';
import { useNavigate } from 'react-router-dom';
import EventoForm from '../components/EventoForm';
import './CriarEvento.css';

const CriarEvento = () => {
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    // Exibe mensagem de sucesso por um tempo e depois redireciona
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };
  
  const handleCancel = () => {
    navigate('/');
  };
  
  return (
    <div className="criar-evento-page">
      <header className="app-header">
        <h1>Sistema de Gerenciamento de Leitos</h1>
      </header>
      
      <div className="page-content">
        <EventoForm 
          onSuccess={handleSuccess} 
          onCancel={handleCancel} 
        />
      </div>
    </div>
  );
};

export default CriarEvento;