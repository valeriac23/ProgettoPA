/**
 *  Dichiarazione del modulo 'node-dijkstra' per l'uso in TypeScript.
 *  Questa definizione permette l'importazione e l'utilizzo tipizzato del pacchetto
 * */ 
declare module 'node-dijkstra' {
  class Graph {
    constructor();

    /**
     * Metodo per aggiungere un nodo e i suoi archi con pesi associati.
     * 
     * @param name Nome del nodo 
     * @param edges Oggetto con nodi adiacenti come chiavi e peso dell'arco come valore
     *           
     */
    addNode(name: string, edges: Record<string, number>): void;
    
    /**
     * Metodo per calcolare il percorso più breve tra due nodi.
     * 
     * */
    path(
      start: string,
      end: string,
      options?: { cost?: boolean }
    ): string[] | { path: string[]; cost: number };
  }

  export = Graph;
}
