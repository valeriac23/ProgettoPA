import express, { Request, Response, Router } from 'express';
import { User, GraphModel } from '../models/models';
import { authenticateJWT, AuthenticatedRequest, requireToken} from '../middleware/authMiddleware';
import { getTokens } from '../utils/tokenUtils';
import Graph = require('node-dijkstra');
import { StatusCodes } from 'http-status-codes';

const router: Router = express.Router();


/**
 * Rotta per eseguire la ricerca del percorso ottimo tra due nodi di un grafo.
 * Utilizza l'algoritmo di Dijkstra (node-dijkstra).
 * 
 * Richiede:
 *  - Autenticazione JWT
 *  - Almeno 1 token disponibile
 * 
 * Corpo richiesta: { graphId: number, start: string, goal: string }
 * Risposta: percorso ottimo, costo, token residui
 */
router.post('/shortest-path', authenticateJWT, requireToken(1),async (req: AuthenticatedRequest, res: Response): Promise<void> => {

  try {
    const { graphId, start, goal } = req.body;

    // Validazione input
    if (typeof graphId !== 'string' || typeof start !== 'string' || typeof goal !== 'string') {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'graphId, start e goal devono essere stringhe' });
      return;
    }

    const graphModel = await GraphModel.findByPk(graphId);
    if (!graphModel) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Modello di grafo non trovato' });
      return;
    }

    // Costruzione del grafo con Dijkstra
    const graphData = graphModel.getDataValue('graph');
    const route = new Graph();

    for (const from in graphData) {
      route.addNode(from, graphData[from]);
    }

    // Calcolo del percorso ottimo
    const result = route.path(start, goal, { cost: true });

    if (!result || !('path' in result) || !('cost' in result)) {
      res.status(StatusCodes.NOT_FOUND).json({ error: `Nessun percorso da ${start} a ${goal}` });
      return;
    }

    // Ottieni i token residui aggiornati
    const tokens = await getTokens(req.user!.email, true);

    res.status(StatusCodes.OK).json({
      graphId,
      start,
      goal,
      path: result.path,
      totalCost: result.cost,
      residual_tokens: tokens
    });

  } catch (error) {
    console.error('Errore in /execute:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Errore interno del server' });
  }
});

/**
 * Rotta per ottenere la lista dei grafi presenti nel sistema.
 * 
 */
router.get('/all-graphs', authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  try {
    const graphs = await GraphModel.findAll({
      attributes: ['graphId', 'userId', 'cost']
    });
    res.status(StatusCodes.OK).json({ count: graphs.length, graphs });
  } catch (error) {
    console.error('Errore in /list:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Errore interno del server' });
  }
});

/**
 * Rotta per creare un nuovo modello di grafo.
 * 
 * Richiede:
 *  - Autenticazione JWT
 *  - Almeno 1 token disponibile
 * 
 * Il costo del grafo è calcolato come:
 *  - 0.10 token per nodo
 *  - 0.02 token per arco
 * 
 * Il costo viene scalato dai token residui dell'utente.
 * Risposta: ID del grafo creato e costo
 */
router.post('/cost', authenticateJWT, requireToken(1), async (req: Request, res: Response): Promise<void> => {
  console.log('Ricevuta richiesta POST /graphs');
  const nodeTokenCost= 0.10
  const edgeTokenCost= 0.02
  const authReq = req as AuthenticatedRequest;

  try {
    const graph = req.body.graph;
    console.log('graph:', graph);

    if (!graph || typeof graph !== 'object') {
      console.log('Formato grafo non valido');
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Formato grafo non valido' });
      return;
    }

    const user = authReq.user;
    console.log('Utente autenticato:', user);

    if (!user) {
      console.log('Utente non autenticato');
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Utente non autenticato' });
      return;
    }

    // Calcolo nodi e archi
    const nodes = Object.keys(graph).length;
    let edgeCount = 0;
    for (const from in graph) {
      edgeCount += Object.keys(graph[from]).length;
    }

    // Calcolo costo totale
    const cost = parseFloat((nodes * nodeTokenCost + edgeCount * edgeTokenCost).toFixed(2));
    console.log(`Costo totale: ${cost} token`);

    // Controllo credito token utente
    const foundUser = await User.findByPk(user.id_user);
    if (!foundUser || foundUser.getDataValue('residual_tokens') < cost) {
      console.log('Token insufficienti o utente non trovato');
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Token insufficienti' });
      return;
    }

    // Aggiornamento credito
    await foundUser.update({
      residual_tokens: foundUser.getDataValue('residual_tokens') - cost
    });

    const created = await GraphModel.create({
      userId: user.id_user,
      graph,
      cost
    });

    console.log('Grafo creato correttamente');

    res.status(StatusCodes.CREATED).json({
      message: 'Grafo creato con successo',
      graphId: created.getDataValue('graphId'),
      cost
    });

  } catch (error) {
      console.error('Errore completo:', error); 
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Errore interno durante la creazione del grafo' });
}

});

export default router;