import { Request, Response, NextFunction } from 'express';
import { getTokens } from '../utils/tokenUtils';
import { StatusCodes } from 'http-status-codes';

//INTEGRATA IN AUTH MIDDLEWARE, PUò ESSERE ELIMINATA

/**
 * Middleware che controlla se l'utente autenticato ha abbastanza token.
 * 
 * @param costoOperazione Numero di token richiesti per procedere
 * @returns Middleware Express
 */
export function checkTokenSufficiency(costoOperazione: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = (req as any).user?.email;

      if (!email) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Utente non autenticato' });
      }

      const tokensDisponibili = await getTokens(email, false);

      if (tokensDisponibili < costoOperazione) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: `Token insufficienti. Servono ${costoOperazione}, disponibili ${tokensDisponibili}` });
      }

      // Token sufficienti → passa al prossimo middleware o controller
      next();
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Errore durante il controllo dei token' });
    }
  };
}
