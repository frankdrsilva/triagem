import Parse from 'parse/dist/parse.min.js';

/**
 * Inicializa o Parse com as credenciais do .env
 * Esta função é chamada automaticamente na importação do módulo
 */
const initializeParse = () => {
  try {
    // Verifica se o Parse já foi inicializado
    if (!Parse.applicationId) {
      Parse.initialize(
        import.meta.env.VITE_PARSE_APPLICATION_ID,
        import.meta.env.VITE_PARSE_JAVASCRIPT_KEY
      );
      Parse.serverURL = import.meta.env.VITE_PARSE_SERVER_URL;
      console.log('Parse inicializado com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao inicializar o Parse:', error);
    throw new Error('Falha na inicialização do Parse. Verifique as variáveis de ambiente.');
  }
};

// Inicializa o Parse na importação do módulo
initializeParse();

/**
 * Função auxiliar para buscar todos os objetos de uma classe, contornando o limite de 100 resultados
 * @param {Parse.Query} query - A query do Parse já configurada
 * @param {Number} batchSize - Tamanho de cada lote a ser buscado (padrão: 1000)
 * @returns {Promise<Array>} Array completo com todos os objetos encontrados
 */
export const fetchAllObjects = async (query, batchSize = 1000) => {
  let allObjects = [];
  let skip = 0;
  let hasMore = true;

  // Configura o tamanho do lote
  query.limit(batchSize);

  // Busca em lotes até não haver mais resultados
  while (hasMore) {
    query.skip(skip);
    const results = await query.find();
    
    if (results.length > 0) {
      allObjects = [...allObjects, ...results];
      skip += results.length;
      
      // Se o número de resultados for menor que o tamanho do lote, não há mais resultados
      if (results.length < batchSize) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  return allObjects;
};

export default Parse;