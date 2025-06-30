import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const SECRET = process.env.JWT_SECRET as string;


/**
 * Enumerazione dei ruoli disponibili per gli utenti.
 * Utilizzata per distinguere i permessi tra admin e user.
 */
export enum Role {
  ADMIN = 'admin',
  USER = 'user'
}

/**
 * Funzione per creare il token JWT
 * 
 * @param id_user Id dell'utente a cui associare il token
 * @param email Email dell'utente a cui associare il token
 * @param role Ruolo dell'utente (admin o user)
 * @param tokens Token disponibili per effettuare le richieste (token residui)
 * @param expirationDays Durata del token (in giorni)
 * @returns Token JWT firmato in base alle informazioni descritte
 */
export async function createJwt(
  id_user: string,
  email: string,
  role: Role,
  tokens: number,
  expirationDays: number
): Promise<string> {
  const payload = { id_user, email, role, tokens };
  const options: jwt.SignOptions = {
    algorithm: 'HS256', 
    expiresIn: `${expirationDays}d`
  };
  return jwt.sign(payload, SECRET, options);
}

