/*
* File contenente i messaggi di errore personalizzati
*/

export const zeroTokens_message: string = 'Hai 0 token. Non puoi eseguire la richiesta';
export const notEnoughTokens_message: string = 'Non hai token a sufficienza per eseguire la richiesta.';
export const userDoesNotExist_message: string = 'Utente non trovato';
export const userNotAdmin_message: string = 'Solo admin può avviare la rotta';
export const malformedPayload_message: string = 'Bad request.';
export const internalServerError_message: string = 'Errore interno del server';
export const noJwtInTheHeader_message: string = 'La rotta richiede la chiave JWT nell\'header.'; 
export const verifyAndAuthenticate_message: string = 'Autenticazione con token JWT fallita.';
export const incorrectParameter_message: string = 'Parametri mancanti o non inseriti correttamente.';
export const incorrectPayloadHeader_messsage: string = 'Header payload not present.';
export const noAuthHeader_message: string = 'No authorization header in the request.';
export const notFound_message: string = 'Rotta non trovata.';
