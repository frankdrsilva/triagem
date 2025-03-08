import Parse from './parseService';

/**
 * Busca todos os leitos da classe "Leito" no Parse
 * Implementa paginação simples para obter todos os registros
 * @param {string} eventoId - ID opcional do evento para verificar hospedagens
 */
export const getLeitosService = async (eventoId = null) => {
  try {
    let todosLeitos = [];
    let skip = 0;
    const limit = 1000; // Máximo permitido pelo Parse
    let finished = false;
    
    while (!finished) {
      // Nova query para cada lote
      const query = new Parse.Query('Leito');
      query.limit(limit);
      query.skip(skip);
      query.ascending('bloco');
      query.ascending('numero');
      
      const results = await query.find();
      
      todosLeitos = [...todosLeitos, ...results];
      
      if (results.length < limit) {
        finished = true;
      } else {
        skip += limit;
      }
    }
    
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
        
        const hospedagens = await hospedagemQuery.find();
        
        // Para cada hospedagem, marcar o leito correspondente como hospedado
        hospedagens.forEach(hospedagem => {
          const leitoHospedado = hospedagem.get('leito');
          if (leitoHospedado) {
            const leitoIndex = leitos.findIndex(l => l.id === leitoHospedado.id);
            if (leitoIndex >= 0) {
              leitos[leitoIndex].hospedado = true;
              leitos[leitoIndex].hospedagem = {
                id: hospedagem.id,
                nomeHospede: hospedagem.get('nomeHospede'),
                checkIn: hospedagem.get('checkIn')
              };
            }
          }
        });
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