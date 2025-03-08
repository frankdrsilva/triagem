import Parse from './parseService';

/**
 * Busca todos os leitos da classe "Leito" no Parse
 * Implementa paginação simples para obter todos os registros
 */
export const getLeitosService = async () => {
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
    return todosLeitos.map(leito => ({
      id: leito.id,
      numero: leito.get('numero') || '',
      descricao: leito.get('descricao') || '',
      bloco: leito.get('bloco') || 'Sem Bloco',
      createdAt: leito.get('createdAt'),
      updatedAt: leito.get('updatedAt')
    }));
    
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