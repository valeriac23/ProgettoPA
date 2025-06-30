import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Chiave segreta per la firma dei token JWT
const SECRET = process.env.JWT_SECRET!;

/**
 * Genera un token JWT firmato contenente le informazioni minime dell’utente.
 * 
 * @param payload Oggetto contenente:
 *  - id_user: ID dell’utente
 *  - email: Email dell’utente
 *  - role: Ruolo ('user' o 'admin')
 * 
 * @returns Una stringa rappresentante il token firmato valido per 1 ora
 */
export const generateToken = (payload: { 
  id_user: number;
  email: string; 
  role: string
}): string => {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' }); 
};


/**
 * Verifica un token JWT e ne decodifica il contenuto se valido.
 * 
 * @param token Token JWT da verificare
 * @returns Payload decodificato se valido, altrimenti `null`
 */
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
};
