import express from 'express';
import { login } from '../controller/authController';
//import { authenticateJWT } from '../middleware/authMiddleware';
const router = express.Router();

/**
 * POST /login
 * Richiede: { "email": "..." }
 * Risponde: { token: "..." }
 */
/**
 * Rotta per effettuare il login ed ottenere la chiave JWT associata all'utente autenticato
 */
router.post('/login', login);
export default router;