import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import * as GraphService from '../service/graphService';
import { getTokens } from '../utils/tokenUtils';
import { StatusCodes } from 'http-status-codes';


/**
 * Controller per la creazione di un nuovo modello di grafo.
 * Valida l'utente autenticato (iniettato dal middleware) e delega la logica al servizio dedicato.
 * 
 * @param req Richiesta HTTP contenente l'utente autenticato e la struttura del grafo 
 * @param res Risposta HTTP con lo stato della creazione (successo o errore con messaggio)
 */
export async function createGraphModel(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const result = await GraphService.createGraph(req.user!, req.body.graph);
    res.status(result.status).json(result.data);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Errore interno' });
  }
}

/**
 * Controller per eseguire un grafo tra due nodi.
 * Estrae i parametri dal body della richiesta e invoca la logica del percorso ottimo.
 * Alla fine dell'esecuzione, restituisce anche lo stato aggiornato dei token residui dell'utente.
 *
 * @param req - Richiesta HTTP contenente l'utente autenticato e i dati { graphId, start, end }
 * @param res - Risposta HTTP con il percorso ottimale, il costo del percorso, e il tempo di elaborazione
 */
export async function executeGraphModel(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user!;
    const email = user.email; 
  try {
    const { graphId, start, end } = req.body;

    // Esecuzione del grafo con calcolo percorso ottimo
    const result = await GraphService.executeGraph(req.user!, graphId, start, end);

    // Recupero aggiornato del credito (token residui) dopo l'esecuzione
    const residual_final_tokens = await getTokens(email, true);

    res.status(result.status).json(result.data);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Errore interno' });
  }
}


