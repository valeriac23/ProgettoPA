import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import { suggestWeightUpdate, getWeightUpdateHistory } from '../controller/weightsController';

const router = express.Router();


/**
 * Rotta per inviare una richiesta di aggiornamento del peso di un arco nel grafo.
 * 
 * Accesso: Utente autenticato (JWT)
 * Corpo richiesta:
 * {
 *   graphId: string,
 *   fromNode: string,
 *   toNode: string,
 *   suggestedWeight: number
 * }
 * 
 * - Se la variazione proposta è entro il 50%, l’aggiornamento viene applicato subito (media esponenziale).
 * - Se supera il 50%, la richiesta viene salvata con stato "pending" in attesa di approvazione da parte di un admin.
 */
router.post('/update', authenticateJWT, suggestWeightUpdate); 

/**
 * Rotta per recuperare lo storico delle richieste di aggiornamento dei pesi.
 * 
 * Accesso: Utente autenticato (JWT)
 * Querystring:
 *  - graphId: string (opzionale)
 *  - from: string (data di inizio, es: 2024-01-01)
 *  - to: string (data di fine)
 *  - format: 'csv' | undefined
 * 
 * Se `format=csv`, restituisce l’elenco in formato CSV scaricabile.
 * Altrimenti restituisce un array JSON con gli aggiornamenti.
 */
router.get('/history', authenticateJWT, getWeightUpdateHistory);

export default router;
