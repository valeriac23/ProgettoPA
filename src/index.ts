import express from 'express';
import dotenv from 'dotenv';
//import bodyParser from 'body-parser';
dotenv.config(); 

import Database from './config/sequelize';
import graphRoutes from './routes/graph.routes';
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import weightsRoutes from './routes/weightsRoutes';
import { StatusCodes } from 'http-status-codes';

const sequelize = Database.getInstance();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware per il parsing del corpo delle richieste JSON
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/graphs', graphRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/weights', weightsRoutes);

/**
 * Route GET di test per verificare la connessione al database PostgreSQL.
 */
app.get('/', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.send('Connessione a PostgreSQL riuscita!');
  } catch (err) {
    console.error('Errore nel test di connessione:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Errore di connessione al DB');
  }
});

// Avvio dell'applicazione Express sulla porta specificata
app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
