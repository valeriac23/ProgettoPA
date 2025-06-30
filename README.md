# ProgettoPA2425
## Obiettivo 
Lo scopo del progetto è la realizzazione di un sistema backend per la gestione di modelli di ottimizzazione su grafo, con funzionalità di autenticazione via JWT, gestione dinamica dei pesi tramite contributi degli utenti (in stile crowd-sourcing), e controllo del credito tramite token. Il sistema consente agli utenti autenticati di creare grafi, calcolare percorsi ottimali tramite l’algoritmo di Dijkstra e proporre aggiornamenti ai pesi degli archi. Gli aggiornamenti vengono applicati automaticamente o approvati da un admin a seconda della soglia di validità.

Un caso d’uso concreto è il tracciamento dei tempi di percorrenza di sentieri di montagna, aggiornati grazie ai feedback degli utenti.

## Tecnologie utilizzate
- Node.js
- Express
- Sequelize
- PostgreSQL
- Docker
- Postman

## Progettazione
L’intero sistema è stato sviluppato utilizzando TypeScript, facendo uso del framework Express su piattaforma Node.js. Le entità principali sono:

- Utente: autenticato tramite JWT, con ruolo (user, admin) e numero di token disponibili. 
- Modello di grafo: rappresentazione di nodi e archi con pesi, su cui eseguire l’algoritmo di Dijkstra.
- Richiesta di aggiornamento peso: proposta di modifica del costo di un arco da parte di un utente.
- Sistema di autorizzazione e token: ogni operazione consuma token, e il credito è controllato su ogni richiesta.
  
I moduli fondamentali del progetto includono:

- Controller: gestisce le richieste dell’utente e invoca i servizi appropriati.
- Middleware: verifica autenticazione JWT, autorizzazione per ruolo, e gestione token.
- Servizi: logica di business per creazione/esecuzione modelli, aggiornamenti pesi, ricariche token.
- Database: basata su Sequelize e PostgreSQL, con script di seed per utenti e grafi predefiniti.
- Gestione dei pesi: l’aggiornamento avviene con media esponenziale, secondo la formula:
                               p(i,j) = α * p(i,j) + (1 - α) * p_new(i,j)

Tutte le rotte sono protette da autenticazione JWT. Le azioni disponibili sono differenziate per ruolo (user e admin), ed eventuali richieste fuori soglia vengono moderate dall’amministratore.

## Progettazione database
Il progetto utilizza un database PostgreSQL, collocato su un server remoto, a supporto delle funzionalità offerte dal backend. I parametri di connessione, come nome del database, credenziali dell’utente e indirizzo dell’host, sono configurati tramite variabili di ambiente, così da mantenere separata la logica applicativa dai dati sensibili.

## Diagrammi di sequenza
### Login
![login](DIAGRAMMI/loginroutes.jpg)
### Creazione di un modello di grafo
![Cost](DIAGRAMMI/costroutes.jpg)
### Esecuzione di un grafo
![Shortest_path](DIAGRAMMI/shortest_Path.jpg)
### Visualizzazione di tutti i grafi
![all_graphs](DIAGRAMMI/allgraphroutes.jpg)
### Aggiornamento dei pesi di un grafo
![update](DIAGRAMMI/weightsupdate2.jpg)
### Storico degli aggiornamenti dei pesi
![historyweights](DIAGRAMMI/weightshistoryroute.jpg)
### Visualizzazione dei token di un utente
![tokens](DIAGRAMMI/tokenroutes.jpg)
### Refill dei token degli utenti
![refill](DIAGRAMMI/refillroutes.jpg)
### Storico delle richieste di un admin
![historadmin](DIAGRAMMI/historyadminroutes.jpg)
### Visualizzazione delle richieste in attesa
![pending](DIAGRAMMI/pendingroutes.jpg)
### Richieste di accettazione o rifiuto da parte dell'admin
![decision](DIAGRAMMI/decisionroute.jpg)


## Pattern Utilizzati
Durante lo sviluppo sono stati utilizzati diversi patten per migliorare la leggibilità del codice e la struttura delle operazioni.

### Design Pattern
#### Singleton
Il pattern Singleton viene adottato per assicurare la presenza di una singola istanza condivisa della configurazione di database. In questo backend, la connessione tramite Sequelize è gestita da una classe che espone un unico punto di accesso (Database.getInstance()), evitando duplicazioni e migliorando efficienza e controllo delle risorse. Questo approccio assicura una gestione centralizzata della connessione durante l’intero ciclo di vita del backend.
#### Middleware pattern
L’uso dei middleware consente di gestire responsabilità trasversali alle richieste HTTP, come autenticazione e controllo accessi. I middleware implementati verificano la presenza del token JWT, validano il ruolo dell’utente (admin o user) e controllano il numero minimo di token disponibili. Ogni middleware agisce in sequenza, permettendo di mantenere separata la logica di controllo da quella applicativa.
#### Factory Method
In questo caso è stato applicato il Factory Method per astrarre e centralizzare la creazione di oggetti complessi, come gli errori o i token JWT. Ad esempio, nella gestione degli errori, la factory costruisce oggetti standardizzati in base al tipo d’errore, restituendo messaggi coerenti e stati HTTP adeguati. Questo pattern contribuisce a rendere uniforme la logica di risposta e a facilitare l’estensione del sistema.
### Pattern Architetturali
#### MVC
Il progetto segue la filosofia del pattern architetturale MVC:

- Model: definisce la struttura e le relazioni dei dati nel database tramite Sequelize. I modelli includono utenti, grafi, viaggi e richieste di aggiornamento.
- View: non è presente una vista vera e propria, poiché l’applicazione è un'API REST. Le risposte JSON costituiscono il risultato dell’elaborazione lato backend.
- Controller: funge da ponte tra l’interfaccia HTTP e la logica interna, orchestrando validazione, chiamate ai servizi, gestione degli errori e risposte.
  
# Rotte con Postman
In questa sezione vengono analizzate le principali rotte dell'applicazione, testate tramite Postman. Le richieste sono suddivise in base alle funzionalità e ai ruoli a cui sono associate (utente, amministratore, sistema di gestione grafi). Per ciascuna rotta vengono illustrati i parametri inviati, la struttura della risposta e il risultato ottenuto, verificabile direttamente nell’interfaccia di Postman.

## Autenticazione
### Login utenti
#### Rotta

POST http://localhost:3001/auth/login 
#### Descrizione
Per eseguire questa rotta è necessario che l'utente abbia effettuato il login e ottenuto il token di autenticazione JWT.

`Auth Type`: Bearer Token.

`Token`: token JWT

#### Parametri richiesti
Nel body deve essere inserita l'email dell'utente da autenticare

##### Esempio 
```
{
  "email": "giacomoterzi@gmail.com"
}
```

#### Risposta
In risposta si otterrà il token JWT da utilizzare per effettuare le altre rotte, in base al ruolo richiesto da esse, che sia admin o user.

#### Esempio
```
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjozLCJlbWFpbCI6ImdpYWNvbW90ZXJ6aUBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsInRva2VucyI6MjAsImlhdCI6MTc1MTI4OTk3NywiZXhwIjoxNzUxMzc2Mzc3fQ.x-vukk1hZzIPf_cSYNcQXKvV92t8kdx6__Vn2HocA_k"
}
```

## Grafi
Per le seguenti rotte inserire in **Authorization** il token JWT ottenuto dalla `/login`. Selezionare `Auth Type`: Bearer.
### Creazione grafo
#### Rotta

POST http://localhost:3001/graphs/cost
#### Descrizione
Rotta per creare un nuovo modello di grafo. 
### Parametri richiesti
Per prima cosa, in **Authorization** inserire il token JWT ottenuto dal login con Auth Type: Bearer.
Nel body, invece, è necessario inserire una configurazione del grafo in formato raw/JSON.
```
{
  "graph": {
    "A": { "B": 1, "C": 3 },
    "B": { "C": 1, "D": 7 },
    "C": { "D": 2 },
    "D": { "E": 10},
    "E": { "F": 3, "C": 1, "G": 2},
    "F": { "D": 4, "E":10, "G": 20},
    "G": { "H": 1, "E": 2},
    "H": { "G": 1}
  }
}
```
#### Risposta
Il costo del grafo è calcolato in questo modo:
  - 0.10 token per nodo
  - 0.02 token per arco
 
```
{
    "message": "Grafo creato con successo",
    "graphId": "f47ff822-4eee-4d90-bc2d-830352fd125c",
    "cost": 1.12
}
```
### Esecuzione del grafo
#### Rotta

POST http://localhost:3001/graphs/shortest-path
#### Descrizione
Rotta per calcolae il percorso ottimo con l'algoritmo Dijkstra.
### Parametri richiesti
Nel body, è necessario indicare l'Id del grafo creato, il nodo di inizio e il nodo di fine del percorso in formato raw/JSON.

#### Esempio
```
{
  "graphId": f47ff822-4eee-4d90-bc2d-830352fd125c,      
  "start": "A",
  "goal": "H"
}
```

### Risposta
In risposta si otterrà il percorso del grafo, il costo totale del grafo dato dalla somma dei pesi degli archi e i token residui dell'utente. 

#### Esempio
```
{
    "graphId": f47ff822-4eee-4d90-bc2d-830352fd125c,
    "start": "A",
    "goal": "H",
    "path": [
        "A",
        "D",
        "E",
        "G",
        "H"
    ],
    "totalCost": 8,
    "residual_tokens": 198.88
}
```
### Lista dei grafi creati
#### Rotta

GET http://localhost:3001/graphs/all-graphs
#### Descrizione
Rotta per ottenere la lista dei grafi creati dall'utente autenticato.

### Risposta
In risposta si otterrà il numero totale di grafi presenti nel sistema. Per ciascun grafo verranno restituiti: l'ID del grafo, l'ID dell'utente che lo ha creato e il costo associato, che rappresenta i token sottratti al saldo dell’utente al momento della creazione.

#### Esempio
```
{
    "count": 5,
    "graphs": [
        {
            "graphId": "fec504bc-6490-44ce-8a44-f81bd880ec88",
            "userId": "e96afe89-9d49-41fd-bd32-5c9fc4570cca",
            "cost": 1.14
        },
        {
            "graphId": "7ece0f85-e160-434d-8703-4f17161edddf",
            "userId": "e96afe89-9d49-41fd-bd32-5c9fc4570cca",
            "cost": 1.12
        },
        {
            "graphId": "92a88a25-d1a0-4b9f-ab82-e977cf09bef9",
            "userId": "54e48d72-aeb4-48bb-812a-ad9e2ee64113",
            "cost": 1.12
        },
        {
            "graphId": "ad4743eb-6416-49a1-aede-ddf87af1d663",
            "userId": "54e48d72-aeb4-48bb-812a-ad9e2ee64113",
            "cost": 1.12
        },
        {
            "graphId": "2ac23211-587d-4f8c-9ee2-41fc02369945",
            "userId": "762015e6-9fd4-44c9-a4df-27ef6ad84627",
            "cost": 1.12
        }
    ]
}
```
## Weights

#### Rotta

POST http://localhost:3001/weights/update
#### Descrizione
Rotta che permette di aggiornare il peso di uno o più archi.
### Parametri richiesti
Questa rotta richiede l'ID del grafo, il nodo iniziale e finale dell'arco da aggiornare e il nuovo peso dell'arco da aggiornare.
#### Esempio
```
{
  "graphId": "762015e6-9fd4-44c9-a4df-27ef6ad84627",
  "fromNode": "A",
  "toNode": "B",
  "suggestedWeight": 23
}
```
### Risposta
#### Esempio
```
{
    "message": "Richiesta inviata per approvazione admin"
}
```
#### Rotta 

GET http://localhost:3001/weights/history?graphId=1&from=2025-06-01&to=2025-06-30&format=csv
#### Descrizione
Rotta per visualizzare lo storico di tutte le richieste di aggiornamento dei pesi degli archi nel sistema. 

### Parametri richiesti
Essa richiede esclusivamente il token JWT dell'utente admin in **Authorization**.

### Risposta
La rotta restituisce un elenco di tutte le richieste di aggiornamento dei pesi degli archi che sono ancora in attesa di approvazione.
In particolare, per ogni richiesta vengono mostrati i dettagli come l'ID del grafo, i nodi coinvolti, il peso suggerito, l'ID dell’utente che ha effettuato la proposta, lo stato corrente della richiesta e la data di creazione. 
#### Esempio
```
[
    {
        "id": 2,
        "graphId": 1,
        "fromNode": "A",
        "toNode": "B",
        "suggestedWeight": 11,
        "status": "pending",
        "userId": 1,
        "createdAt": "2025-06-30T16:45:12.555Z",
        "updatedAt": "2025-06-30T16:45:12.555Z"
    }
]
```

## Admin
Per eseguire queste rotte inserire in **Authorization** esclusivamente il token JWT ottenuto dal soggetto **admin**.
#### Rotta

POST http://localhost:3001/admin/decision/:id
#### Descrizione
Rotta che permette all'admin di accettare o rifiutare una richieste in attesa ("pending"). 
### Parametri richiesti
Nei parametri, in particolare nella sezione **Path Variables**, specificare l'ID della richiesta da processare, mentre nel body la scelta dell'admin. Può essere:
- **approved**;
- **rejected**;

#### Esempio

```
{ 
    "decision": "rejected" 
}
```

### Risposta
In risposta si otterrà la decisione dell'admin (`approved` o `rejected`) e, in caso di approvazione, il nuovo peso dell’arco calcolato tramite media esponenziale.
La media esponenziale è data dalla formula: `p(i,j) = alpha * p(i,j) + (1 – alpha)*p_new(i,j) `,
dove:
- `p(i,j)` è il precedente costo associato all’arco che collega nodi i-j;
- `p_new` è il nuovo costo suggerito dall’utente;
- `alpha` è un coefficiente di smorzamento che determina quanto "peso" dare al valore attuale rispetto al nuovo suggerimento.

#### Esempio
```
{
    "message": "Richiesta approvata",
    "newWeight": 3.1999999999999993
}
```
#### Rotta

GET http://localhost:3001/admin/pending
#### Descrizione
Questa rotta è accessibile solo agli utenti con ruolo admin e consente loro di visualizzare tutte le richieste in attesa ("pending").

### Parametri richiesti
Essa richiede esclusivamente il token JWT dell'utente admin in **Authorization**.

### Risposta
La rotta restituisce un elenco di tutte le richieste di aggiornamento dei pesi degli archi che sono ancora in attesa di approvazione.
In particolare, per ogni richiesta vengono mostrati i dettagli come l'ID del grafo, i nodi coinvolti, il peso suggerito, l'ID dell’utente che ha effettuato la proposta, lo stato corrente della richiesta e la data di creazione. 
#### Esempio
```
[
    {
        "id": "7ea2d338-8667-4cdc-9736-99d890b5c195",
        "graphId": "2ac23211-587d-4f8c-9ee2-41fc02369945",
        "fromNode": "A",
        "toNode": "C",
        "suggestedWeight": 20,
        "status": "pending",
        "userId": "762015e6-9fd4-44c9-a4df-27ef6ad84627",
        "createdAt": "2025-06-30T18:36:10.979Z",
        "updatedAt": "2025-06-30T18:36:10.981Z"
    }
]
```
#### Rotta

GET http://localhost:3001/admin/history
#### Descrizione
Rotta per visualizzare lo storico di tutte le richieste di aggiornamento dei pesi degli archi nel sistema. 

### Parametri richiesti
Essa richiede il token JWT dell'utente autenticato in **Authorization**.
Nei parametri, invece, richiede:
- `format`: csv.

### Risposta
La rotta restituisce un file CSV contenente:

- `graphId`: ID del grafo interessato;
- `fromNode`: nodo di partenza dell’arco;
- `toNode`: nodo di destinazione;
- `suggestedWeight`: peso suggerito dall’utente;
- `status`: stato della richiesta (pending, approved, rejected);
- `createdAt`: data di creazione della richiesta.
  
#### Esempio
```
graphId;fromNode;toNode;suggestedWeight;status;createdAt
2ac23211-587d-4f8c-9ee2-41fc02369945;A;C;20;pending;Mon Jun 30 2025 18:36:10 GMT+0000 (Coordinated Universal Time)
2ac23211-587d-4f8c-9ee2-41fc02369945;A;C;20;pending;Mon Jun 30 2025 18:38:05 GMT+0000 (Coordinated Universal Time)
```
## User
#### Rotta

POST http://localhost:3001/user/refill
#### Descrizione
Rotta per ricaricare i token utente. Questa può essere eseguita solo dagli utenti admin.

### Parametri richiesti
Essa richiede il token JWT dell'utente autenticato in **Authorization**.
Nei parametri, invece, richiede:
- `email`: email dell'utente a cui effettuare la ricarica;
- `tokens`: numero di token da ricaricare;
#### Esempio
```
{
  "email": "giacomoterzi@gmail.com",
  "tokens": 5
}
```
### Risposta
La rotta restituisce il numero di token totali dell'utente dopo l'aggiornamento.

#### Esempio
```
{
    "message": "Token aggiornati",
    "new_tokens": 25
}
```
#### Rotta

GET http://localhost:3001/user/tokens
#### Descrizione
Rotta per visualizzare i token utente.

### Parametri richiesti
Essa richiede il token JWT dell'utente autenticato in **Authorization**.
Nel caso in cui si vuole visualizzare il numero di token residui di un singolo utente, è necessario inserire l'email dell'utente nei parametri.

### Risposta
La rotta restituisce il numero di token totali degli utenti.

#### Esempio
```
{
    "successo": true,
    "data": [
        {
            "email": "aldoverdi@gmail.com",
            "residual_tokens": 200
        },
        {
            "email": "valeriapaffi@gmail.com",
            "residual_tokens": 200
        },
        {
            "email": "giacomoterzi@gmail.com",
            "residual_tokens": 20
        }
    ]
}
```
## Avvio Applicazione
Per poter correttamente avviare il sistema bisogna disporre dei seguenti requsiti:
- Docker
- Docker Compose
- Node.js
- Express
- Sequelize

### Istruzioni
1. Clonare il seguente repository github nella propria directory o scaricare il file .zip;
2. Eseguire la build del progetto:
   `docker-compose build`
4. Eseguire il run del progetto:
  `docker-compose up`

Nel database sono presenti già tre utenti:
```
user1 = {
            name: 'Aldo',
            surname: 'Verdi',
            email: 'aldoverdi@gmail.com',
            role: 'admin',
            residual_tokens: 200
        },
user2 = {
            name: 'Valeria',
            surname: 'Paffi',
            email: 'valeriapaffi@gmail.com',
            role: 'user',
            residual_tokens: 200
        },
user3 = {
            name: 'Giacomo',
            surname: 'Terzi',
            email: 'giacomoterzi@gmail.com',
            role: 'user',
            residual_tokens: 20
        }
```

# Autrice del progetto

Valeria Cannone
