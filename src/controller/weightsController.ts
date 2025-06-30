import { Request, Response } from 'express';
import { CostGraphUpdate, GraphModel, Trip } from '../models/models';
import { Op } from 'sequelize';
import { StatusCodes } from 'http-status-codes';
import { CSVColumn, CSV_SEPARATOR } from '../utils/enumCSV';



/**
 * Controller per gestire la richiesta di aggiornamento del peso di un arco in un grafo.
 * 
 * - Se la variazione è entro il 50% del peso attuale, aggiorna direttamente il grafo con media esponenziale.
 * - Altrimenti, salva la richiesta per l'approvazione dell'amministratore (stato 'pending').
 *
 * @param req Richiesta HTTP con corpo contenente l'aggiornamento e utente autenticato
 * @param res Risposta HTTP con esito aggiornamento o creazione richiesta
 */
export async function suggestWeightUpdate(req: Request, res: Response): Promise<void> {
  try {
    console.log("Richiesta ricevuta:", req.body);
    console.log("Utente:", (req as any).user);

    const { graphId, fromNode, toNode, suggestedWeight } = req.body;
    const userId = (req as any).user.id_user;

    if (!graphId || !fromNode || !toNode || typeof suggestedWeight !== 'number') {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Parametri mancanti o invalidi' });
      return;
    }

    // Recupero grafo dal DB
    const graph = await GraphModel.findByPk(graphId);
    if (!graph) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Grafo non trovato' });
      return;
    }

    const graphData = graph.getDataValue('graph');
    const currentWeight = graphData?.[fromNode]?.[toNode];

    // Verifica esistenza arco specificato
    if (currentWeight === undefined) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Arco non esistente nel grafo' });
      return;
    }

    // Calcolo della variazione percentuale proposta (50%)
    const delta = Math.abs(suggestedWeight - currentWeight);
    const percentage = delta / currentWeight;

    // Caso 1: variazione entro il 50% → aggiornamento immediato
    if (percentage <= 0.5) {
      const alpha = parseFloat(process.env.ALPHA || '0.9');
      const newWeight = alpha * currentWeight + (1 - alpha) * suggestedWeight;
      graphData[fromNode][toNode] = newWeight;
      await graph.update({ graph: graphData });

      res.status(StatusCodes.OK).json({ message: 'Aggiornamento applicato', newWeight });
      // Caso 2: variazione maggiore del 50%  → richiesta salvata per approvazione manuale da parte dell'admin
    } else {
      await CostGraphUpdate.create({
        graphId,
        fromNode,
        toNode,
        suggestedWeight,
        userId,
        status: 'pending'
      });

      res.status(StatusCodes.CREATED).json({ message: 'Richiesta inviata per approvazione admin' });
    }
  } catch (err) {
    console.error('Errore in suggestWeightUpdate:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Errore interno del server' });
  }
}

/**
 * Controller per ottenere lo storico delle richieste di aggiornamento dei pesi di un grafo.
 * 
 * Supporta l’esportazione in formato JSON o CSV, con possibilità di filtrare per data.
 * 
 * @param req Richiesta HTTP contenente eventuali filtri querystring (graphId, from, to, format)
 * @param res Risposta HTTP con elenco aggiornamenti in formato JSON o CSV
 */
export async function getWeightUpdateHistory(req: Request, res: Response): Promise<void> {
  try {
    const { graphId, from, to, format } = req.query;

    const whereClause: any = {};
    if (graphId) whereClause.graphId = Number(graphId);
    
    if (from || to) {
      const startDate = from ? new Date(from as string) : null;
      const endDate = to ? new Date(to as string) : null;

      if ((startDate && isNaN(startDate.getTime())) || (endDate && isNaN(endDate.getTime()))) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Formato data non valido (usa yyyy-mm-dd)' });
        return;
      }

      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = startDate;
      if (endDate) whereClause.createdAt[Op.lte] = endDate;
    }

    const updates = await CostGraphUpdate.findAll({ where: whereClause });

    if (format === 'csv') {
      const CSV_SEPARATOR= ';';

      const csv = updates.map(u =>
        [
          u.getDataValue(CSVColumn.GraphId),
          u.getDataValue(CSVColumn.FromNode),
          u.getDataValue(CSVColumn.ToNode),
          u.getDataValue(CSVColumn.SuggestedWeight),
          u.getDataValue(CSVColumn.Status),
          u.getDataValue(CSVColumn.CreatedAt)
        ].join(CSV_SEPARATOR)
      );

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename="updates.csv"');
      res.send(`${Object.values(CSVColumn).join(CSV_SEPARATOR)}\n${csv.join('\n')}`);
    } else {
      res.json(updates);
    }

  } catch (error) {
    console.error('Errore in getWeightUpdateHistory:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Errore interno' });
  }
}