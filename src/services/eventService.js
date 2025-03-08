import Parse from './parseService';

/**
 * Busca todos os eventos ativos
 */
export const getEventosService = async () => {
  try {
    const query = new Parse.Query('Evento');
    query.equalTo('ativo', true);
    query.ascending('dataInicio');
    
    const results = await query.find();
    
    return results.map(evento => ({
      id: evento.id,
      nome: evento.get('nome') || '',
      descricao: evento.get('descricao') || '',
      dataInicio: evento.get('dataInicio'),
      dataFim: evento.get('dataFim'),
      ativo: evento.get('ativo'),
      createdAt: evento.get('createdAt'),
      updatedAt: evento.get('updatedAt')
    }));
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    throw error;
  }
};

/**
 * Verifica se há algum evento em andamento na data atual
 * @returns {Promise<Object|null>} Evento em andamento ou null se não houver
 */
export const getEventoEmAndamentoService = async () => {
  try {
    const dataAtual = new Date();
    
    const query = new Parse.Query('Evento');
    query.equalTo('ativo', true);
    query.lessThanOrEqualTo('dataInicio', dataAtual);
    query.greaterThanOrEqualTo('dataFim', dataAtual);
    
    const result = await query.first();
    
    if (!result) return null;
    
    return {
      id: result.id,
      nome: result.get('nome') || '',
      descricao: result.get('descricao') || '',
      dataInicio: result.get('dataInicio'),
      dataFim: result.get('dataFim'),
      ativo: result.get('ativo')
    };
  } catch (error) {
    console.error('Erro ao verificar evento em andamento:', error);
    throw error;
  }
};

/**
 * Verifica se existe algum evento agendado para o período informado
 * @param {Date} dataInicio - Data de início do evento
 * @param {Date} dataFim - Data de término do evento
 * @returns {Promise<boolean>} - True se existir algum evento no período, False caso contrário
 */
export const verificaEventoNoPeriodo = async (dataInicio, dataFim) => {
  try {
    const query = new Parse.Query('Evento');
    query.equalTo('ativo', true);
    
    // Busca eventos que começam durante o novo evento
    const query1 = new Parse.Query('Evento');
    query1.greaterThanOrEqualTo('dataInicio', dataInicio);
    query1.lessThanOrEqualTo('dataInicio', dataFim);
    
    // Busca eventos que terminam durante o novo evento
    const query2 = new Parse.Query('Evento');
    query2.greaterThanOrEqualTo('dataFim', dataInicio);
    query2.lessThanOrEqualTo('dataFim', dataFim);
    
    // Busca eventos que englobam completamente o novo evento
    const query3 = new Parse.Query('Evento');
    query3.lessThanOrEqualTo('dataInicio', dataInicio);
    query3.greaterThanOrEqualTo('dataFim', dataFim);
    
    // Combina todas as consultas com OR
    const mainQuery = Parse.Query.or(query1, query2, query3);
    mainQuery.equalTo('ativo', true);
    
    const results = await mainQuery.find();
    
    return results.length > 0;
  } catch (error) {
    console.error('Erro ao verificar eventos no período:', error);
    throw error;
  }
};

/**
 * Cria um novo evento
 * @param {Object} eventoData - Dados do evento a ser criado
 * @returns {Promise<Object>} - Evento criado
 */
export const criarEventoService = async (eventoData) => {
  try {
    // Verifica se já existe evento no período
    const eventoExistente = await verificaEventoNoPeriodo(
      eventoData.dataInicio,
      eventoData.dataFim
    );
    
    if (eventoExistente) {
      throw new Error('Já existe um evento programado para este período.');
    }
    
    // Cria o novo evento
    const Evento = Parse.Object.extend('Evento');
    const novoEvento = new Evento();
    
    novoEvento.set('nome', eventoData.nome);
    novoEvento.set('descricao', eventoData.descricao);
    novoEvento.set('dataInicio', eventoData.dataInicio);
    novoEvento.set('dataFim', eventoData.dataFim);
    novoEvento.set('ativo', true);
    
    const eventoSalvo = await novoEvento.save();
    
    return {
      id: eventoSalvo.id,
      nome: eventoSalvo.get('nome'),
      descricao: eventoSalvo.get('descricao'),
      dataInicio: eventoSalvo.get('dataInicio'),
      dataFim: eventoSalvo.get('dataFim'),
      ativo: eventoSalvo.get('ativo'),
      createdAt: eventoSalvo.get('createdAt'),
      updatedAt: eventoSalvo.get('updatedAt')
    };
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    throw error;
  }
};