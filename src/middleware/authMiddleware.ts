import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt, { JwtPayload } from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!;
if (!SECRET) throw new Error('JWT_SECRET non definita');


/**
 * Estensione dell'interfaccia Request di Express per includere i dati dell'utente autenticato.
 * Viene popolata dal middleware `authenticateJWT`.
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id_user: number;
    email: string;
    role: string;
    residual_tokens: number;
  };
}

/**
 * Middleware per autenticare le richieste HTTP tramite JWT.
 * - Verifica la presenza del token nella header `Authorization`
 * - Decodifica il token e inietta i dati dell’utente nella richiesta (`req.user`)
 * 
 * @param req Richiesta HTTP
 * @param res Risposta HTTP
 * @param next Funzione per passare al middleware successivo
 */
export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  // Verifica che l'header contenga un token JWT in formato "Bearer <token>"
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Token mancante' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET) as JwtPayload;
    
    req.user = {
    id_user: decoded.id_user,
    email: decoded.email,
    role: decoded.role,
    residual_tokens: decoded.tokens
  };


    next();
  } catch (err) {
    res.status(StatusCodes.FORBIDDEN).json({ message: 'Token non valido' });
  }
};

/**
 * Middleware per autorizzare solo utenti con uno dei ruoli specificati.
 * 
 * @param roles Lista di ruoli autorizzati (admin o user)
 * @returns Middleware Express
 */
export const authorizeRoles = (...roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    const user = req.user;

    if (!user || !roles.includes(user.role)) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Accesso negato: ruolo non autorizzato' });
      return;
    }

    next();
  };
};

/**
 * Middleware per verificare che l'utente abbia un numero minimo di token disponibili.
 * 
 * Utile per bloccare l’accesso a funzionalità che consumano token.
 * 
 * @param min Numero minimo di token richiesti
 * @returns Middleware Express
 */
export const requireToken = (min: number) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    const user = req.user;

    if (!user || user.residual_tokens < min) {
      res.status(StatusCodes.NOT_ACCEPTABLE).json({ message: 'Non hai token a sufficienza' });
      return;
    }

    next();
  };
};
