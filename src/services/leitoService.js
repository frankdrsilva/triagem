import Parse from './parseService';

/**
 * Busca todos os leitos da classe "Leito" no Parse
 * Implementa paginação simples para obter todos os registros
 * @param {string} eventoId - ID opcional do evento para verificar hospedagens
 */
export const getLeitosService = async (eventoId = null) => {
  try {
    // Buscar todos os leitos diretamente sem limite
    const query = new Parse.Query('Leito');
    query.ascending('bloco');
    query.ascending('numero');
    query.limit(1000000); // Um valor grande para buscar todos os leitos
    
    const todosLeitos = await query.find();
    
    console.log(`Total de leitos recuperados: ${todosLeitos.length}`);
    
    // Converte para objetos JavaScript
    const leitos = todosLeitos.map(leito => ({
      id: leito.id,
      numero: leito.get('numero') || '',
      descricao: leito.get('descricao') || '',
      bloco: leito.get('bloco') || 'Sem Bloco',
      createdAt: leito.get('createdAt'),
      updatedAt: leito.get('updatedAt'),
      hospedado: false // Por padrão, o leito não está hospedado
    }));
    
    // Se um eventoId foi fornecido, verificar hospedagens
    if (eventoId) {
      try {
        // Buscar todas as hospedagens do evento
        const evento = await new Parse.Query('Evento').get(eventoId);
        const hospedagemQuery = new Parse.Query('Hospedagem');
        hospedagemQuery.equalTo('evento', evento);
        hospedagemQuery.include('leito');
        hospedagemQuery.limit(1000000); // Um valor grande para buscar todas as hospedagens
        
        const hospedagens = await hospedagemQuery.find();
        console.log(`Total de hospedagens encontradas: ${hospedagens.length}`);
        
        // Para cada hospedagem, marcar o leito correspondente como hospedado
        for (const hospedagem of hospedagens) {
          const leitoHospedado = hospedagem.get('leito');
          if (leitoHospedado) {
            const leitoId = leitoHospedado.id;
            console.log(`Tentando marcar leito ID ${leitoId} como hospedado`);
            
            const leitoIndex = leitos.findIndex(l => l.id === leitoId);
            if (leitoIndex >= 0) {
              leitos[leitoIndex].hospedado = true;
              leitos[leitoIndex].hospedagem = {
                id: hospedagem.id,
                nomeHospede: hospedagem.get('nomeHospede'),
                checkIn: hospedagem.get('checkIn')
              };
              console.log(`Leito ${leitos[leitoIndex].numero} (ID: ${leitoId}) marcado como hospedado`);
            } else {
              console.warn(`Leito com ID ${leitoId} não encontrado na lista de leitos`);
            }
          } else {
            console.warn('Hospedagem sem leito associado encontrada');
          }
        }
        
        // Log dos leitos marcados como hospedados
        const leitosHospedados = leitos.filter(l => l.hospedado);
        console.log(`Total de leitos marcados como hospedados: ${leitosHospedados.length}`);
        console.log('IDs dos leitos hospedados:', leitosHospedados.map(l => l.id));
        
      } catch (err) {
        console.error('Erro ao verificar hospedagens:', err);
      }
    }
    
    return leitos;
    
  } catch (error) {
    console.error('Erro ao buscar leitos:', error);
    throw error;
  }
};

/**
 * Busca um leito específico por ID
 */
export const getLeitoById = async (leitoId) => {
  try {
    const query = new Parse.Query('Leito');
    const leito = await query.get(leitoId);
    
    return {
      id: leito.id,
      numero: leito.get('numero') || '',
      descricao: leito.get('descricao') || '',
      bloco: leito.get('bloco') || 'Sem Bloco',
      createdAt: leito.get('createdAt'),
      updatedAt: leito.get('updatedAt')
    };
  } catch (error) {
    console.error(`Erro ao buscar leito com ID ${leitoId}:`, error);
    throw error;
  }
};
