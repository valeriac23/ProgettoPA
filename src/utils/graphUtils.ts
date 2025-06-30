import Graph = require('node-dijkstra');

/**
 * Calcola il costo di creazione di un grafo sulla base del numero di nodi e archi.
 * 
 * @param graph Oggetto JSON che rappresenta la struttura del grafo
 * @returns Numero decimale rappresentante il costo totale in token
 */
export function calcGraphCost(graph: Record<string, Record<string, number>>): number {
  const nodeTokenCost= 0.10
  const edgeTokenCost= 0.02
  const nodes = Object.keys(graph).length;
  let edges = 0;
  for (const src in graph) {
    edges += Object.keys(graph[src]).length;
  }
  const cost = nodes * nodeTokenCost + edges * edgeTokenCost;
  return parseFloat(cost.toFixed(2));
}

/**
 * Verifica se la struttura del grafo è valida.
 * - Deve essere un oggetto
 * - Ogni nodo deve avere archi con pesi numerici > 0
 * 
 * @param graph Oggetto JSON del grafo
 * @returns true se il grafo è valido, false altrimenti
 */
export function isValidGraph(graph: any): boolean {
  if (typeof graph !== 'object' || graph === null) return false;
  for (const from in graph) {
    const neighbors = graph[from];
    if (typeof neighbors !== 'object') return false;
    for (const to in neighbors) {
      const weight = neighbors[to];
      if (typeof weight !== 'number' || weight <= 0) return false;
    }
  }
  return true;
}

/**
 * Calcola il percorso più breve tra due nodi in un grafo usando node-dijkstra.
 * 
 * @param graph Grafo in formato JSON (nodi → { adiacente: peso })
 * @param from Nodo di partenza
 * @param to Nodo di arrivo
 * @returns Oggetto con percorso (array di nodi) e costo totale
 * @throws Error se il percorso non è trovato
 */
export function getShortestPath(
  graph: Record<string, Record<string, number>>,
  from: string,
  to: string
): { path: string[]; cost: number } {
  const route = new Graph();
  for (const fromNode in graph) {
    route.addNode(fromNode, graph[fromNode]);
  }

  const result = route.path(from, to, { cost: true });
  if (!result || !('path' in result) || !('cost' in result)) {
    throw new Error(`Percorso non trovato da ${from} a ${to}`);
  }

  return {
    path: result.path,
    cost: result.cost
  };
}
