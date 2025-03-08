/**
 * Atualiza uma hospedagem existente
 * @param {Object} hospedagemData - Dados da hospedagem
 * @param {string} hospedagemData.id - ID da hospedagem
 * @param {string} hospedagemData.nomeHospede - Novo nome do hóspede
 * @returns {Promise<Object>} - Hospedagem atualizada
 */
export const atualizarHospedagemService = async (hospedagemData) => {
    try {
      // Obter a hospedagem
      const hospedagemQuery = new Parse.Query('Hospedagem');
      const hospedagem = await hospedagemQuery.get(hospedagemData.id);
      
      // Atualizar atributos
      hospedagem.set('nomeHospede', hospedagemData.nomeHospede);
      
      // Salvar no Parse
      const hospedagemSalva = await hospedagem.save();
      
      return {
        id: hospedagemSalva.id,
        nomeHospede: hospedagemSalva.get('nomeHospede'),
        checkIn: hospedagemSalva.get('checkIn'),
        leito: {
          id: hospedagemSalva.get('leito').id,
          numero: hospedagemSalva.get('leito').get('numero')
        },
        evento: {
          id: hospedagemSalva.get('evento').id,
          nome: hospedagemSalva.get('evento').get('nome')
        }
      };
    } catch (error) {
      console.error('Erro ao atualizar hospedagem:', error);
      throw error;
    }
  };
  
  /**
   * Remove uma hospedagem pelo ID
   * @param {string} hospedagemId - ID da hospedagem a ser removida
   * @returns {Promise<boolean>} - True se removido com sucesso
   */
  export const removerHospedagemService = async (hospedagemId) => {
    try {
      // Obter a hospedagem
      const hospedagemQuery = new Parse.Query('Hospedagem');
      const hospedagem = await hospedagemQuery.get(hospedagemId);
      
      // Remover do Parse
      await hospedagem.destroy();
      
      return true;
    } catch (error) {
      console.error('Erro ao remover hospedagem:', error);
      throw error;
    }
  };import Parse from './parseService';
  
  /**
   * Cria uma nova hospedagem no Parse
   * @param {Object} hospedagemData - Dados da hospedagem
   * @param {string} hospedagemData.nomeHospede - Nome do hóspede
   * @param {Date} hospedagemData.checkIn - Data de check-in
   * @param {string} hospedagemData.leitoId - ID do leito
   * @param {string} hospedagemData.eventoId - ID do evento
   * @returns {Promise<Object>} - Hospedagem criada
   */
  export const criarHospedagemService = async (hospedagemData) => {
    try {
      // Obter referências aos objetos Leito e Evento
      const leito = await new Parse.Query('Leito').get(hospedagemData.leitoId);
      const evento = await new Parse.Query('Evento').get(hospedagemData.eventoId);
      
      // Criar objeto Hospedagem
      const Hospedagem = Parse.Object.extend('Hospedagem');
      const novaHospedagem = new Hospedagem();
      
      // Definir atributos
      novaHospedagem.set('nomeHospede', hospedagemData.nomeHospede);
      novaHospedagem.set('checkIn', hospedagemData.checkIn);
      novaHospedagem.set('leito', leito);
      novaHospedagem.set('evento', evento);
      
      // Salvar no Parse
      const hospedagemSalva = await novaHospedagem.save();
      
      return {
        id: hospedagemSalva.id,
        nomeHospede: hospedagemSalva.get('nomeHospede'),
        checkIn: hospedagemSalva.get('checkIn'),
        leito: {
          id: leito.id,
          numero: leito.get('numero')
        },
        evento: {
          id: evento.id,
          nome: evento.get('nome')
        }
      };
    } catch (error) {
      console.error('Erro ao criar hospedagem:', error);
      throw error;
    }
  };
  
  /**
   * Verifica se um leito já está hospedado no evento atual
   * @param {string} leitoId - ID do leito
   * @param {string} eventoId - ID do evento
   * @returns {Promise<boolean>} - True se o leito estiver hospedado, False caso contrário
   */
  export const verificaLeitoHospedadoService = async (leitoId, eventoId) => {
    try {
      // Obter referências aos objetos Leito e Evento
      const leito = await new Parse.Query('Leito').get(leitoId);
      const evento = await new Parse.Query('Evento').get(eventoId);
      
      // Buscar hospedagens para o leito e evento especificados
      const query = new Parse.Query('Hospedagem');
      query.equalTo('leito', leito);
      query.equalTo('evento', evento);
      
      // Contar resultados
      const count = await query.count();
      
      return count > 0;
    } catch (error) {
      console.error('Erro ao verificar hospedagem:', error);
      throw error;
    }
  };
  
  /**
   * Busca todas as hospedagens de um evento
   * @param {string} eventoId - ID do evento
   * @returns {Promise<Array>} - Lista de hospedagens
   */
  export const getHospedagensDoEventoService = async (eventoId) => {
    try {
      const evento = await new Parse.Query('Evento').get(eventoId);
      
      const query = new Parse.Query('Hospedagem');
      query.equalTo('evento', evento);
      query.include('leito');
      
      const results = await query.find();
      
      return results.map(hospedagem => ({
        id: hospedagem.id,
        nomeHospede: hospedagem.get('nomeHospede'),
        checkIn: hospedagem.get('checkIn'),
        leito: {
          id: hospedagem.get('leito').id,
          numero: hospedagem.get('leito').get('numero'),
          bloco: hospedagem.get('leito').get('bloco')
        }
      }));
    } catch (error) {
      console.error('Erro ao buscar hospedagens do evento:', error);
      throw error;
    }
  };