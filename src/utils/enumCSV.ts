/**
 * Enumerazione delle colonne CSV usate per esportare lo storico delle richieste di aggiornamento peso.
 */
export enum CSVColumn {
  GraphId = 'graphId',
  FromNode = 'fromNode',
  ToNode = 'toNode',
  SuggestedWeight = 'suggestedWeight',
  Status = 'status',
  CreatedAt = 'createdAt'
}

/**
 * Separatore standard da utilizzare nella generazione del file CSV.
 * 
 * È impostato su `;` per maggiori compatibilità 
 */
export const CSV_SEPARATOR = ';';