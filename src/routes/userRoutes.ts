import express from 'express';
import { Request, Response } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import { visualizeTokens, rechargeTokens } from '../controller/userController';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { StatusCodes } from 'http-status-codes';


const router = express.Router();

/**
 * Rotta per visualizzare i token degli utenti.
 */
router.get('/tokens', authenticateJWT, async (req, res) => {
  const email = req.query.email as string | undefined;
  await visualizeTokens(res, email);
});

/**
 * Rotta per ricaricare i token utente, eseguibile solo da admin
 */
router.post('/refill', authenticateJWT, authorizeRoles('admin'), async (req:AuthenticatedRequest, res:Response) => {
  const { email, tokens } = req.body;

  if (!email || typeof tokens !== 'number') {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'Email e numero di token richiesti' });
  }

  await rechargeTokens(email, tokens, res);
  console.log("Token ricaricati");
});


export default router;
