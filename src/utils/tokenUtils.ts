import { User } from '../models/models';
import { Op } from 'sequelize';

/**
 * Ottiene i token residui di un utente.
 * 
 * @param email Email dell'utente
 * @param checkResidual Se true, restituisce i token anche se sono 0; se false, restituisce solo se > 0
 *                      - Utile per bloccare richieste quando l'utente ha finito i token
 * @returns Numero di token residui
 */
export async function getTokens(email: string, checkResidual = false): Promise<number> {
  const user = await User.findOne({
    attributes: ['residual_tokens'],
    where: checkResidual
      ? { email }
      : { email, residual_tokens: { [Op.gt]: 0 } }
  });

  const rawTokens = user?.getDataValue('residual_tokens');
  return rawTokens ?? 0;

}

/**
 * Aggiorna i token residui di un utente.
 * 
 * @param email Email dell'utente
 * @param newTokenValue Nuovo valore dei token
 */
export async function updateTokens(email: string, newTokenValue: number): Promise<void> {
  await User.update({ residual_tokens: newTokenValue }, { where: { email } });
}
