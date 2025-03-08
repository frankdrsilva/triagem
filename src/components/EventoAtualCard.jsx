import React from 'react';
import './EventoAtualCard.css';

const EventoAtualCard = ({ evento }) => {
  // Função para formatar a data
  const formatarData = (data) => {
    if (!data) return '';
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="evento-atual-card">
      <div className="evento-atual-conteudo">
        {evento ? (
          <>
            <div className="evento-atual-header">
              <h3>Evento em Andamento</h3>
              <span className="evento-atual-status">ATIVO</span>
            </div>
            <h2 className="evento-atual-nome">{evento.nome}</h2>
            <div className="evento-atual-periodo">
              <span className="evento-atual-data">De: {formatarData(evento.dataInicio)}</span>
              <span className="evento-atual-data">Até: {formatarData(evento.dataFim)}</span>
            </div>
            {evento.descricao && (
              <p className="evento-atual-descricao">{evento.descricao}</p>
            )}
          </>
        ) : (
          <div className="evento-atual-sem-evento">
            <h3>Sem evento em andamento</h3>
            <p>Não há eventos ativos no momento</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventoAtualCard;