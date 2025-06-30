import { Request, Response } from 'express';  
import { User, UserAttributes } from '../models/models';
import { createJwt, Role } from '../jwt/jwt_generator';
import { StatusCodes } from 'http-status-codes';

/**
 * Funzione di login che autentica un utente tramite email e genera un token JWT contenente le informazioni essenziali.
 *
 * @param req Oggetto Request contenente il campo 'email' nel body
 * @param res Oggetto Response che restituisce il token JWT in formato JSON
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body; 
    
     // Validazione: verifica che l'email sia presente e sia una stringa
    if (!email || typeof email !== 'string') {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email non valida' });
      return;
    }

    const userInstance = await User.findOne({ where: { email } });

    if (!userInstance) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Utente non trovato'}); 
      return;
    }

    const user: UserAttributes = userInstance.get({ plain: true });

    /**
     * Generazione del JWT.
     * Il token contiene:
     * - ID utente
     * - Email
     * - Ruolo (user o admin)
     * - Token residui disponibili
     * - Numero minimo di token richiesti per effettuare una chiamata (in questo caso 1)
     */
    const token = await createJwt(
      user.id_user,
      user.email,
      user.role as Role,
      user.residual_tokens,
      1
    );

    // Restituisce il token all'utente
    res.json({ token });
  } catch (err) {
    console.error("Errore nel login:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Errore interno' });
  }
}
