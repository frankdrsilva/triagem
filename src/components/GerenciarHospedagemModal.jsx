import React, { useState } from 'react';
import './GerenciarHospedagemModal.css'; // Use o CSS específico

const GerenciarHospedagemModal = ({ leito, evento, onClose, onUpdate, onRemove }) => {
  const [nomeHospede, setNomeHospede] = useState(leito.hospedagem?.nomeHospede || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modo, setModo] = useState('visualizar'); // 'visualizar' ou 'editar'

  const handleEditar = () => {
    setModo('editar');
  };

  const handleCancelar = () => {
    setNomeHospede(leito.hospedagem?.nomeHospede || '');
    setModo('visualizar');
  };

  const handleSalvar = async () => {
    if (!nomeHospede.trim()) {
      setError('O nome do hóspede não pode estar vazio.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (onUpdate) {
        await onUpdate(leito, { nomeHospede: nomeHospede.trim() });
      }
      // Fechar o modal após salvar
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar hospedagem:', err);
      setError(err.message || 'Ocorreu um erro ao atualizar a hospedagem.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemover = async () => {
    if (!window.confirm('Tem certeza que deseja esvaziar este leito?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (onRemove) {
        await onRemove(leito);
      }
      onClose();
    } catch (err) {
      console.error('Erro ao remover hospedagem:', err);
      setError(err.message || 'Ocorreu um erro ao esvaziar o leito.');
      setLoading(false);
    }
  };

  return (
    <div className="hospedagem-modal-overlay">
      <div className="hospedagem-modal">
        <div className="hospedagem-modal-header">
          <h2>Gerenciar Hospedagem</h2>
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

          <div className="form-group">
            <label htmlFor="nomeHospede">Nome do Hóspede</label>
            {modo === 'editar' ? (
              <input
                type="text"
                id="nomeHospede"
                value={nomeHospede}
                onChange={(e) => setNomeHospede(e.target.value)}
                disabled={loading}
                autoFocus
              />
            ) : (
              <div className="hospede-nome-display">{leito.hospedagem?.nomeHospede}</div>
            )}
          </div>

          <div className="hospedagem-modal-actions">
            {modo === 'visualizar' ? (
              <>
                <button
                  type="button"
                  className="btn-edit"
                  onClick={handleEditar}
                  disabled={loading}
                >
                  Editar Nome
                </button>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={handleRemover}
                  disabled={loading}
                >
                  Esvaziar Leito
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancelar}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-submit"
                  onClick={handleSalvar}
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GerenciarHospedagemModal;