import React, { useState } from 'react';
import { criarHospedagemService, verificaLeitoHospedadoService } from '../services/hospedagemService';
import './HospedagemModal.css';

const HospedagemModal = ({ leito, evento, onClose, onSuccess }) => {
  const [nomeHospede, setNomeHospede] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nomeHospede.trim()) {
      setError('Por favor, insira o nome do hóspede.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Verificar se o leito já está hospedado
      const leitoHospedado = await verificaLeitoHospedadoService(leito.id, evento.id);
      
      if (leitoHospedado) {
        setError(`O leito ${leito.numero} já está ocupado para este evento.`);
        setLoading(false);
        return;
      }
      
      // Criar hospedagem
      const hospedagemData = {
        nomeHospede: nomeHospede.trim(),
        checkIn: new Date(),
        leitoId: leito.id,
        eventoId: evento.id
      };
      
      const novaHospedagem = await criarHospedagemService(hospedagemData);
      
      // Notificar sucesso
      if (onSuccess) {
        onSuccess(novaHospedagem);
      }
      
      // Fechar modal
      onClose();
      
    } catch (err) {
      console.error('Erro ao registrar hospedagem:', err);
      setError(err.message || 'Ocorreu um erro ao registrar a hospedagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hospedagem-modal-overlay">
      <div className="hospedagem-modal">
        <div className="hospedagem-modal-header">
          <h2>Registrar Hospedagem</h2>
          <button className="close-button" onClick={onClose} aria-label="Fechar">×</button>
        </div>
        
        <div className="hospedagem-modal-content">
          <div className="leito-info">
            <p><strong>Leito:</strong> {leito.numero}</p>
            <p><strong>Bloco:</strong> {leito.bloco}</p>
          </div>
          
          <div className="evento-info">
            <p><strong>Evento:</strong> {evento.nome}</p>
          </div>
          
          {error && (
            <div className="hospedagem-error">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nomeHospede">Nome do Hóspede*</label>
              <input
                type="text"
                id="nomeHospede"
                value={nomeHospede}
                onChange={(e) => setNomeHospede(e.target.value)}
                placeholder="Digite o nome do hóspede"
                disabled={loading}
                autoFocus
                required
              />
            </div>
            
            <div className="hospedagem-modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Registrar Hospedagem'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HospedagemModal;