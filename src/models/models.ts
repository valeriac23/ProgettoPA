import { Model, DataTypes, Optional } from 'sequelize'; //Sequelize, 
import Database from "../config/sequelize";
import { UUIDV4 } from 'sequelize';
import { calcGraphCost } from '../utils/graphUtils';



// Interfaccia dei campi (UserAttributes) e quella per la creazione (UserCreationAttributes)
export interface UserAttributes {
  id_user: string;
  name: string;
  surname: string;
  email: string;
  residual_tokens: number;
  role: 'admin' | 'user';
}

type UserCreationAttributes = Optional<UserAttributes, 'id_user'>;

//const sequelize: Sequelize = Database.getInstance();
const sequelize = Database.getInstance();
/**
 * Definizione della tabella 'User'
 */
export const User = sequelize.define<Model<UserAttributes, UserCreationAttributes>>('users', {
    id_user: {
        type: DataTypes.UUID,  
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    surname: {
        type: DataTypes.STRING(50),
        allowNull: false
    }, 
    email: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    residual_tokens: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'user'),
        allowNull: false,
        defaultValue: 'user'
    }
}, {
    tableName: 'users'
});

/**
 * Definizione della tabella 'GraphModel', modello per rappresentare un grafo salvato nel sistema.
 * Il grafo è memorizzato in formato JSON.
 */
export const GraphModel = sequelize.define('GraphModel', {
  graphId: {
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id_user'
    }
  },
  graph: {
    type: DataTypes.JSON,
    allowNull: false
  },
  cost: {
    type: DataTypes.DOUBLE,
    allowNull: false
  }
}, {
  tableName: 'graphs' 
});

/**
 * Definizione della tabella 'Trip' 
 * 
 * Rappresenta un'esecuzione del grafo (viaggio), con percorso, costo e tempo di esecuzione.
 */

export const Trip = sequelize.define('trip', {
    tripId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    graphId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull:false
    },
    userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
    },
    startNode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    endNode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    resultPath: {
        type: DataTypes.ARRAY(DataTypes.STRING),  
        allowNull: false
    },
    cost: {
        type: DataTypes.DOUBLE, 
        allowNull: false
    },
    executionTimeMs: {
        type: DataTypes.INTEGER,
        allowNull: false
  },
    executedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
  }
},{
    tableName: 'trip'
});

/**
 * Definizione della tabella 'CostGraphUpdate'
 * Modello per gestire le richieste di aggiornamento dei pesi da parte degli utenti.
 * Include stato (pending, approved, rejected).
 */
export const CostGraphUpdate = sequelize.define('CostGraphUpdate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  graphId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    references: {
            model: GraphModel,
            key: 'graphId'
        }
  },
  fromNode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  toNode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  suggestedWeight: {
    type: DataTypes.DOUBLE, 
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  userId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'CostGraphUpdate'
});

/**
 * Relazione tra User e GraphModel
 * Un utente può creare molti grafi.
 * Se l'utente viene eliminato, vengono eliminati anche i grafi (CASCADE).
 */
User.hasMany(GraphModel, {
  foreignKey: {
    name: 'userId',
    allowNull: false,
  },
  onDelete: 'CASCADE',
});
GraphModel.belongsTo(User, { foreignKey: 'userId' });

/**
 * Funzione per la sincronizzazione delle tabelle nel DB e per il seed
 * 
 */
const syncModels = async () => {
    try {
        await sequelize.sync({ force: true });
        await createUsers();
        await graphConfiguration();
    } catch (error) {
        console.error('Errore durante la sincronizzazione dei modelli:', error);
    }
};


/**
 * Funzione per la creazione degli utenti nel database
 */
async function createUsers() {
    try {
        const newAdmin = await User.create({
            name: 'Aldo',
            surname: 'Verdi',
            email: 'aldoverdi@gmail.com',
            role: 'admin',
            residual_tokens: 200
        });
        const newUser1 = await User.create({
            name: 'Valeria',
            surname: 'Paffi',
            email: 'valeriapaffi@gmail.com',
            role: 'user',
            residual_tokens: 200
        });
        const newUser2 = await User.create({
            name: 'Giacomo',
            surname: 'Terzi',
            email: 'giacomoterzi@gmail.com',
            role: 'user',
            residual_tokens: 20
        });
    } catch (error) {
        console.error('Errore durante la creazione dell\'utente:', error);
    }
}

async function graphConfiguration() {
  try {
    const user1 = await User.findOne({ where: { email: 'valeriapaffi@gmail.com' } });
    const user2 = await User.findOne({ where: { email: 'giacomoterzi@gmail.com' } });

    if (!user1 || !user2) {
      throw new Error('Utenti non trovati');
    }

    const user1Id = user1.getDataValue('id_user');
    const user2Id = user2.getDataValue('id_user');

    const graphs: { userId: string; graph: Record<string, Record<string, number>> }[] = [
      {
        userId: user1Id,
        graph: {
          A: { B: 3, C: 2, D: 4 },
          B: { C: 1, E: 6 },
          C: { F: 5, D: 2 },
          D: { G: 3, C: 2 },
          E: { D: 4, H: 2 },
          F: { G: 1, E: 2, H: 1 },
          G: { H: 3 },
          H: { A: 2, B: 1 }
        }
      },
      {
        userId: user1Id,
        graph: {
          A: { B: 1, C: 2 },
          B: { D: 3, E: 4 },
          C: { F: 2, G: 5 },
          D: { H: 1, A: 2 },
          E: { F: 3, H: 2 },
          F: { G: 1, B: 2 },
          G: { H: 1, C: 1 },
          H: { A: 1, D: 2 }
        }
      },
      {
        userId: user2Id,
        graph: {
          A: { B: 2, C: 3, D: 4 },
          B: { E: 2, F: 3 },
          C: { G: 1 },
          D: { H: 2, C: 2 },
          E: { F: 1, G: 2 },
          F: { H: 2, A: 3 },
          G: { B: 2, D: 2 },
          H: { C: 1, E: 1 }
        }
      },
      {
        userId: user2Id,
        graph: {
          A: { B: 1, C: 1 },
          B: { D: 1, E: 1 },
          C: { F: 1, G: 1 },
          D: { H: 1, A: 1 },
          E: { C: 1, H: 1 },
          F: { B: 1, G: 1 },
          G: { H: 1, D: 1 },
          H: { A: 1, E: 1 }
        }
      }
    ];

    for (const g of graphs) {
      const cost = calcGraphCost(g.graph);
      await GraphModel.create({
        userId: g.userId,
        graph: g.graph,
        cost
      });
    }

    console.log('✅ Grafi creati correttamente.');
  } catch (error) {
    console.error('Errore nella creazione dei grafi:', error);
  }
}

syncModels();



