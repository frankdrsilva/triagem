import React, { useEffect, useState } from 'react';
import { getLeitosService } from '../services/leitoService';
import './TelaInicial.css';

const TelaInicial = () => {
  const [leitos, setLeitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Função para buscar todos os leitos
    const fetchLeitos = async () => {
      try {
        setLoading(true);
        const results = await getLeitosService();
        setLeitos(results);
      } catch (err) {
        console.error('Erro ao buscar leitos:', err);
        setError('Não foi possível carregar os leitos. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    // Executa a busca
    fetchLeitos();

    // Configura o document e HTML para 100% altura
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.getElementById('root').style.height = '100%';
    document.getElementById('root').style.display = 'flex';
    document.getElementById('root').style.flexDirection = 'column';
  }, []);

  // Agrupa leitos por bloco
  const leitosPorBloco = leitos.reduce((acc, leito) => {
    const bloco = leito.bloco || 'Sem Bloco';
    if (!acc[bloco]) {
      acc[bloco] = [];
    }
    acc[bloco].push(leito);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="tela-inicial">
        <header className="app-header">
          <h1>Sistema de Gerenciamento de Leitos</h1>
        </header>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Carregando leitos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tela-inicial">
        <header className="app-header">
          <h1>Sistema de Gerenciamento de Leitos</h1>
        </header>
        <div className="error-container">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tela-inicial">
      <header className="app-header">
        <h1>Sistema de Gerenciamento de Leitos ({leitos.length} total)</h1>
      </header>
      
      <div className="blocos-container">
        {Object.keys(leitosPorBloco)
          .sort((a, b) => a.localeCompare(b, 'pt-BR'))
          .map((bloco) => (
            <div key={bloco} className="bloco-section">
              <div className="bloco-header">
                <h2>Bloco {bloco}</h2>
                <span className="quantidade-leitos">{leitosPorBloco[bloco].length} leitos</span>
              </div>
              
              <div className="leitos-grid">
                {leitosPorBloco[bloco]
                  .sort((a, b) => String(a.numero).localeCompare(String(b.numero), 'pt-BR', { numeric: true }))
                  .map((leito) => (
                    <button 
                      key={leito.id} 
                      className="leito-card"
                      onClick={() => console.log(`Leito selecionado: ${leito.numero}`, leito)}
                      aria-label={`Leito ${leito.numero}`}
                    >
                      <span className="leito-numero">{leito.numero}</span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default TelaInicial;