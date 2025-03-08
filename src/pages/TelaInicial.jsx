import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeitosService } from '../services/leitoService';
import { getEventoEmAndamentoService } from '../services/eventService';
import { atualizarHospedagemService, removerHospedagemService } from '../services/hospedagemService';
import EventoAtualCard from '../components/EventoAtualCard';
import HospedagemModal from '../components/HospedagemModal';
import GerenciarHospedagemModal from '../components/GerenciarHospedagemModal';
import './TelaInicial.css';

const TelaInicial = () => {
  const navigate = useNavigate();
  const [leitos, setLeitos] = useState([]);
  const [eventoAtual, setEventoAtual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para o modal de hospedagem
  const [showModal, setShowModal] = useState(false);
  const [showGerenciarModal, setShowGerenciarModal] = useState(false);
  const [leitoSelecionado, setLeitoSelecionado] = useState(null);

  useEffect(() => {
    // Função para buscar todos os leitos e verificar evento em andamento
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Primeiro, buscar o evento atual
        const eventoAtualResult = await getEventoEmAndamentoService();
        
        // Em seguida, buscar leitos com informações de hospedagem (se houver evento)
        const leitosResults = await getLeitosService(
          eventoAtualResult ? eventoAtualResult.id : null
        );
        
        setLeitos(leitosResults);
        setEventoAtual(eventoAtualResult); // Pode ser null se não houver evento em andamento
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Não foi possível carregar os dados. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    // Executa as buscas
    fetchData();

    // Configura o document e HTML para 100% altura
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.getElementById('root').style.height = '100%';
    document.getElementById('root').style.display = 'flex';
    document.getElementById('root').style.flexDirection = 'column';
    
    // Configurar atualização automática a cada 10 segundos
    const intervalo = setInterval(() => {
      fetchData();
    }, 30000);
    
    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(intervalo);
  }, []);

  // Função para lidar com o clique em um leito
  const handleLeitoClick = (leito) => {
    // Se não houver evento em andamento, apenas mostra informações do leito no console
    if (!eventoAtual) {
      console.log(`Leito selecionado: ${leito.numero}`, leito);
      return;
    }
    
    // Se o leito já estiver hospedado, abre o modal de gerenciamento
    if (leito.hospedado) {
      setLeitoSelecionado(leito);
      setShowGerenciarModal(true);
      return;
    }
    
    // Se houver evento em andamento e o leito estiver disponível, abre o modal de hospedagem
    setLeitoSelecionado(leito);
    setShowModal(true);
  };
  
  // Função chamada após registro bem-sucedido da hospedagem
  const handleHospedagemSuccess = (hospedagem) => {
    console.log('Hospedagem registrada com sucesso:', hospedagem);
    
    // Atualizar a lista de leitos para refletir a nova hospedagem
    setLeitos(leitos.map(leito => {
      if (leito.id === hospedagem.leito.id) {
        return {
          ...leito,
          hospedado: true,
          hospedagem: {
            id: hospedagem.id,
            nomeHospede: hospedagem.nomeHospede,
            checkIn: hospedagem.checkIn
          }
        };
      }
      return leito;
    }));
  };
  
  // Função para atualizar uma hospedagem existente
  const handleHospedagemUpdate = async (leito, dadosAtualizados) => {
    if (!leito.hospedagem?.id) {
      console.error('ID da hospedagem não encontrado');
      return;
    }
    
    const hospedagemAtualizada = await atualizarHospedagemService({
      id: leito.hospedagem.id,
      nomeHospede: dadosAtualizados.nomeHospede
    });
    
    // Atualizar a lista de leitos
    setLeitos(leitos.map(l => {
      if (l.id === leito.id) {
        return {
          ...l,
          hospedagem: {
            ...l.hospedagem,
            nomeHospede: hospedagemAtualizada.nomeHospede
          }
        };
      }
      return l;
    }));
  };
  
  // Função para remover uma hospedagem
  const handleHospedagemRemove = async (leito) => {
    if (!leito.hospedagem?.id) {
      console.error('ID da hospedagem não encontrado');
      return;
    }
    
    await removerHospedagemService(leito.hospedagem.id);
    
    // Atualizar a lista de leitos
    setLeitos(leitos.map(l => {
      if (l.id === leito.id) {
        // Remover o status de hospedado e dados da hospedagem
        const { hospedado, hospedagem, ...leitoAtualizado } = l;
        return {
          ...leitoAtualizado,
          hospedado: false
        };
      }
      return l;
    }));
  };
  
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
          <button 
            className="btn-retry" 
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tela-inicial">
      <header className="app-header">
        <h1>Sistema de Gerenciamento de Leitos ({leitos.filter(leito => !leito.hospedado).length} disponíveis)</h1>
      </header>
      
      <div className="acoes-container">
        <button 
          className="btn-criar-evento"
          onClick={() => navigate('/criar-evento')}
        >
          Criar Evento
        </button>
      </div>
      
  
      <div className="blocos-container">
            {/* Card de evento em andamento */}
      <EventoAtualCard evento={eventoAtual} />
      
        {Object.keys(leitosPorBloco)
          .sort((a, b) => a.localeCompare(b, 'pt-BR'))
          .map((bloco) => (
            <div key={bloco} className="bloco-section">
              <div className="bloco-header">
                <h2>Bloco {bloco}</h2>
                <span className="quantidade-leitos">
                  {leitosPorBloco[bloco].filter(leito => !leito.hospedado).length} disponíveis / {leitosPorBloco[bloco].length} total
                </span>
              </div>
              
              <div className="leitos-grid">
                {leitosPorBloco[bloco]
                  .sort((a, b) => String(a.numero).localeCompare(String(b.numero), 'pt-BR', { numeric: true }))
                  .map((leito) => (
                    <button 
                      key={leito.id} 
                      className={`leito-card ${leito.hospedado ? 'ocupado' : ''}`}
                      onClick={() => handleLeitoClick(leito)}
                      aria-label={`Leito ${leito.numero}`}
                      title={leito.hospedado ? `Ocupado por: ${leito.hospedagem?.nomeHospede || 'Hóspede'}` : `Leito ${leito.numero}`}
                    >
                      <span className="leito-numero">{leito.numero}</span>
                      {leito.hospedado && <span className="leito-ocupado-indicador"></span>}
                      {/* Badge de seta para baixo em leitos pares */}
                      {parseInt(leito.numero) % 2 === 0 && 
                        <div className="leito-badge leito-badge-down">▼</div>
                      }
                      {/* Badge de seta para cima em leitos ímpares */}
                      {parseInt(leito.numero) % 2 !== 0 && 
                        <div className="leito-badge leito-badge-up">▲</div>
                      }
                    </button>
                  ))}
              </div>
            </div>
          ))}
      </div>
      
      {/* Modal de hospedagem */}
      {showModal && leitoSelecionado && eventoAtual && (
        <HospedagemModal
          leito={leitoSelecionado}
          evento={eventoAtual}
          onClose={() => setShowModal(false)}
          onSuccess={handleHospedagemSuccess}
        />
      )}
      
      {/* Modal para gerenciar hospedagem existente */}
      {showGerenciarModal && leitoSelecionado && eventoAtual && (
        <GerenciarHospedagemModal
          leito={leitoSelecionado}
          evento={eventoAtual}
          onClose={() => setShowGerenciarModal(false)}
          onUpdate={handleHospedagemUpdate}
          onRemove={handleHospedagemRemove}
        />
      )}
    </div>
  );
};

export default TelaInicial;