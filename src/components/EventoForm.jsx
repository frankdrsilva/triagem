import React, { useState } from 'react';
import { criarEventoService } from '../services/eventService';
import './EventoForm.css';

const EventoForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    dataInicio: '',
    dataFim: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Converte as strings de data para objetos Date
      const eventoData = {
        ...formData,
        dataInicio: new Date(formData.dataInicio),
        dataFim: new Date(formData.dataFim)
      };
      
      // Validações básicas
      if (eventoData.dataInicio > eventoData.dataFim) {
        throw new Error('A data de início não pode ser posterior à data de término.');
      }
      
      // Envia para o serviço
      const novoEvento = await criarEventoService(eventoData);
      
      setSuccess(true);
      setFormData({
        nome: '',
        descricao: '',
        dataInicio: '',
        dataFim: ''
      });
      
      // Chama o callback de sucesso se fornecido
      if (onSuccess) {
        onSuccess(novoEvento);
      }
      
    } catch (err) {
      console.error('Erro ao criar evento:', err);
      setError(err.message || 'Ocorreu um erro ao criar o evento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="evento-form-container">
      <form className="evento-form" onSubmit={handleSubmit}>
        <h2>Criar Novo Evento</h2>
        
        {error && (
          <div className="form-error">
            {error}
          </div>
        )}
        
        {success && (
          <div className="form-success">
            Evento criado com sucesso!
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="nome">Nome do Evento*</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            placeholder="Nome do evento"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="dataInicio">Data de Início*</label>
          <input
            type="datetime-local"
            id="dataInicio"
            name="dataInicio"
            value={formData.dataInicio}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="dataFim">Data de Término*</label>
          <input
            type="datetime-local"
            id="dataFim"
            name="dataFim"
            value={formData.dataFim}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            rows="4"
            placeholder="Descreva o evento"
            disabled={loading}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-submit" 
            disabled={loading}
          >
            {loading ? 'Criando...' : 'Criar Evento'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventoForm;