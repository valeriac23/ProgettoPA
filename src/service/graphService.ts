import { StatusCodes } from 'http-status-codes';
import { GraphModel, Trip, User } from '../models/models';
import { calcGraphCost, getShortestPath, isValidGraph } from '../utils/graphUtils';

/**
 * Funzione/Servizio per la creazione e salvataggio di un grafo associato a un utente.
 * 
 * @param user Utente autenticato che effettua la creazione (con ID e token residui)
 * @param graph Struttura del grafo ottenuto 
 * @returns Oggetto con `status` e `data` da restituire al controller
 */
export async function createGraph(user: any, graph: any) {
  if (!isValidGraph(graph)) {
    return {status: StatusCodes.BAD_REQUEST, data: { message: 'Grafo non valido' }};
  }

  const cost = calcGraphCost(graph);
  if (user.residual_tokens < cost) {
    return { status: StatusCodes.NOT_ACCEPTABLE, data: { message: 'Token insufficienti' } };
  }

  const newGraph = await GraphModel.create({ userId: user.id_user, graph, cost });
  const userInstance = await User.findByPk(user.id_user);
  if (userInstance) {
    const currentTokens = userInstance.getDataValue('residual_tokens');
    await userInstance.update({ residual_tokens: currentTokens - cost });
  }

  return {
    status: StatusCodes.CREATED,
    data: {
      message: 'Grafo creato',
      graphId: newGraph.getDataValue('graphId'),
      cost
    }
  };
}


/**
 * Esegue il grafo richiesto calcolando il percorso ottimale tra due nodi.
 * Controlla l'esistenza del grafo, verifica i token dell’utente,
 * calcola il percorso, salva i dati del viaggio e aggiorna i token.
 *
 * @param user - Oggetto utente autenticato (contenente id e token residui)
 * @param graphId - ID del grafo da eseguire
 * @param start - Nodo di partenza
 * @param end - Nodo di arrivo
 * @returns Oggetto con status HTTP e dati (path, cost, executionTimeMs) o errore
 */
export async function executeGraph(user: any, graphId: number, start: string, end: string) {
  const graphEntry = await GraphModel.findByPk(graphId);
  if (!graphEntry) {
    return { status: StatusCodes.NOT_FOUND, data: { message: 'Grafo non trovato' } };
  }

  const graph = graphEntry.getDataValue('graph');
  const cost = graphEntry.getDataValue('cost');

  if (user.residual_tokens < cost) {
    return { status: StatusCodes.NOT_ACCEPTABLE, data: { message: 'Token insufficienti' } };
  }

  const startTime = Date.now();
  const { path, cost: pathCost } = getShortestPath(graph, start, end);
  const execTime = Date.now() - startTime;

  await Trip.create({
    graphId,
    userId: user.id_user,
    startNode: start,
    endNode: end,
    resultPath: path,
    cost: pathCost,
    executionTimeMs: execTime
  });

  const userInstance = await User.findByPk(user.id_user);
  if (userInstance) {
    const currentTokens = userInstance.getDataValue('residual_tokens');
    await userInstance.update({ residual_tokens: currentTokens - cost });
  }

  return {
    status: StatusCodes.OK,
    data: { path, cost: pathCost, executionTimeMs: execTime }
  };
}

