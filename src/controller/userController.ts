import { Sequelize } from "sequelize";
import { User } from "../models/models"
import { EnumError, getError } from "../factory/errors";
import { Response, Request } from "express";
import { StatusCodes } from "http-status-codes";
import { authorizeRoles } from "../middleware/authMiddleware";


/**
 * Funzione helper per restituire una risposta HTTP formattata a partire da un errore predefinito.
 * 
 * @param enum_error Enumerazione dell'errore da restituire
 * @param res Oggetto Response Express per inviare la risposta HTTP
 */
export function controllerErrors(enum_error: EnumError, res: any) {
    const new_err = getError(enum_error).getErrorObj();
    res.status(new_err.status).json(new_err.message);
}

/**
 * Funzione per visualizzare il numero di token di un utente.
 * 
 * - Se viene fornita un'email, restituisce i token residui di quell'utente.
 * - Altrimenti, restituisce la lista di tutti gli utenti con i rispettivi token.
 * 
 * @param res Oggetto Response Express per inviare errori
 * @param email Email dell'utente da visualizzare
 * @returns Oggetto con stato di successo e dati richiesti, oppure errore gestito
 */
export async function visualizeTokens(res: Response, email?: string): Promise<void> {
  try {
    if (email !== undefined) {
      const value = await User.findOne({
        where: { email },
        attributes: ['residual_tokens']
      });
      if (!value) throw new Error();

      const tokens = value.getDataValue('residual_tokens') as number;
      res.status(StatusCodes.OK).json({ successo: true, data: tokens });
    } else {
      const value = await User.findAll({
        attributes: ['email', 'residual_tokens']
      });
      if (!value) throw new Error();

      res.status(StatusCodes.OK).json({ successo: true, data: value });
    }
  } catch (error: any) {
    controllerErrors(EnumError.InternalServerError, res);
  }
}


/**
 * Funzione per ricaricare i token degli utenti
 * 
 * - Cerca l'utente tramite email
 * - Somma i nuovi token ai token attuali
 * - Aggiorna il campo `residual_tokens` nel database
 * 
 * @param email Email dell'utente a cui si vuole ricaricare il credito token
 * @param new_tokens Numero di tokens da ricaricare all'utente
 * @param res Risposta del server con il risultato
 * @returns Risposta HTTP con esito dell'operazione
 */
export async function rechargeTokens(email: string, tokens: number, res: Response): Promise<Response> {
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Utente non trovato'});
    }

    // Calcolo del nuovo credito
    const actualTokens = user.getDataValue('residual_tokens');
    const new_tokens = actualTokens + tokens;

    // Aggiornamento del database
    await user.update({ residual_tokens: new_tokens });

    return res.status(StatusCodes.OK).json({ message: 'Token aggiornati', new_tokens });
  } catch (err) {
    console.error('Errore in rechargeTokens:', err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Errore interno' });
  }
}
