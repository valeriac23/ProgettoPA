import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();


export const JWT_SECRET = process.env.JWT_SECRET || '${JWT_SECRET}';
export const ALPHA = parseFloat(process.env.ALPHA || '0.9');

/**
 * Classe singleton Database
 * Responsabile dell'inizializzazione e accesso all'istanza Sequelize del database Postgres
 */
export class Database {
  private static instance: Sequelize;

  private constructor() {}

 /**
   * Metodo statico per ottenere l'istanza unica di Sequelize
   * Se non esiste, la crea utilizzando i parametri forniti dal file .env
   * @returns Istanza di Sequelize collegata al database Postgres
   */
  public static getInstance(): Sequelize {
    if (!Database.instance) {
      const dbName = process.env.POSTGRES_DB as string;
      const dbUser = process.env.POSTGRES_USER as string;
      const dbPassword = process.env.POSTGRES_PASSWORD;
      const dbHost = process.env.POSTGRES_HOST || '${POSTGRES_HOST}';
      const dbPort = parseInt(process.env.POSTGRES_PORT || '${POSTGRES_PORT}');

      // Creazione dell'istanza Sequelize configurata per Postgres
      Database.instance = new Sequelize(dbName, dbUser, dbPassword, {
        host: dbHost,
        port: dbPort,
        dialect: 'postgres',
        logging: false,
      });

    }
    
    return Database.instance;
  }
}
    
//const dbInstance = Database.getInstance();
export default Database;
