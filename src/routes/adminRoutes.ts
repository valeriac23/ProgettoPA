import express, { Request, Response } from 'express';
import { GraphModel, CostGraphUpdate } from '../models/models';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import { Op } from 'sequelize';
import { StatusCodes } from 'http-status-codes';
import { CSVColumn,CSV_SEPARATOR } from '../utils/enumCSV';
const router = express.Router();

/** 
 * Rotta per consentire a un utente admin di approvare o rifiutare
 * una richiesta "pending" di aggiornamento del peso di un arco in un grafo.
 */
/*
 * Parametri:
 *  - :id → ID della richiesta da processare
 *  - body: { decision: 'approved' | 'rejected' }
 */
router.post('/decision/:id', authenticateJWT, authorizeRoles('admin'), async (req: Request, res: Response) => {
  try {
    const updateId = req.params.id;
    const { decision } = req.body;

    if (!['approved', 'rejected'].includes(decision)) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Decisione non valida. Usa "approved" o "rejected"' });
      return;
    }

    const updateReq = await CostGraphUpdate.findByPk(updateId);
    if (!updateReq) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Richiesta non trovata' });
      return;
    }

    if (updateReq.getDataValue('status') !== 'pending') {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Richiesta già processata' });
      return;
    }

    if (decision === 'rejected') {
      await updateReq.update({ status: 'rejected' });
      res.json({ message: 'Richiesta rifiutata' });
      return;
    }

    const model = await GraphModel.findByPk(updateReq.getDataValue('graphId'));
    if (!model) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Modello non trovato' });
      return;
    }

    const graph = model.getDataValue('graph') as Record<string, Record<string, number>>;
    const from = updateReq.getDataValue('fromNode');
    const to = updateReq.getDataValue('toNode');
    const suggested = updateReq.getDataValue('suggestedWeight');

    const currentWeight = graph[from]?.[to];
    if (currentWeight === undefined) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Arco non trovato nel grafo' });
      return;
    }

    const envAlpha = parseFloat(process.env.ALPHA || '0.9');
    const alpha = envAlpha > 0 && envAlpha < 1 ? envAlpha : 0.9;
    const newWeight = alpha * currentWeight + (1 - alpha) * suggested;
    graph[from][to] = newWeight;

    await model.update({ graph });
    await updateReq.update({ status: 'approved' });

    res.json({ message: 'Richiesta approvata', newWeight });
  } catch (error) {
    console.error('Errore admin:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Errore interno del server' });
  }
});

/**
 * Rotta che elabora le richieste "pending", ovvero in attesa di approvazione
 */
router.get('/pending', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const pending = await CostGraphUpdate.findAll({
      where: { status: 'pending' }
    });
    res.json(pending);
  } catch (error) {
    console.error('Errore in /pending:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Errore interno del server' });
  }
});


/**
 * Rotta per visualizzare lo storico di tutte le richieste di aggiornamento dei pesi degli archi nel sistema. 
 *  * Query params:
 *  - graphId: ID del grafo
 *  - from: data di inizio
 *  - to: data di fine
 *  - format: 'csv' 
 */
router.get('/history', authenticateJWT, authorizeRoles('admin', 'user'), async (req, res) => {
  try {
    const { graphId, from, to, format } = req.query;

    const whereClause: any = {};
    if (graphId) whereClause.graphId = graphId;
    if (from || to) {
      whereClause.createdAt = {};
      if (from) whereClause.createdAt[Op.gte] = new Date(from as string);
      if (to) whereClause.createdAt[Op.lte] = new Date(to as string);
    }

    const updates = await CostGraphUpdate.findAll({ where: whereClause });

    if (format === 'csv') {
      const CSV_SEPARATOR = ';';

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
      res.header('Content-Disposition', 'attachment; filename="history.csv"');
      res.send(`${Object.values(CSVColumn).join(CSV_SEPARATOR)}\n${csv.join('\n')}`);
    } else {
      res.json(updates);
    }
  } catch (error) {
    console.error('Errore in /history:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Errore interno' });
  }
});

export default router;
