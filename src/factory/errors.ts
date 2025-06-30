import * as Message from '../factory/error_messages'

/**
 * Interfaccia 'IErrorObj'
 * 
 */

interface IErrorObj {
    status: number;
    message: string;
    getErrorObj(): { message: string, status: number }
}

export class NotEnoughTokens implements IErrorObj {
    status: number;
    message: string;
    constructor() {
        this.status = 401;
        this.message = Message.notEnoughTokens_message;
    }
    getErrorObj(): { message: string; status: number } {
        return {
            status: this.status,
            message: this.message
        }
    }
}

export class UserDoesNotExist implements IErrorObj {
    status: number;
    message: string;
    constructor() {
        this.status = 400;
        this.message = Message.userDoesNotExist_message;
    }
    getErrorObj(): { message: string; status: number } {
        return {
            status: this.status,
            message: this.message
        }
    }
}

export class UserNotAdmin implements IErrorObj {
    status: number;
    message: string;
    constructor() {
        this.status = 403;
        this.message = Message.userNotAdmin_message;
    }
    getErrorObj(): { message: string; status: number } {
        return {
            status: this.status,
            message: this.message
        }
    }
}

export class MalformedPayload implements IErrorObj {
    status: number;
    message: string;
    constructor() {
        this.status = 404;
        this.message = Message.malformedPayload_message;
    }
    getErrorObj(): { message: string; status: number } {
        return {
            status: this.status,
            message: this.message
        }
    }
}

export class InternalServerError implements IErrorObj {
    status: number;
    message: string;
    constructor() {
        this.status = 500;
        this.message = Message.internalServerError_message;
    }
    getErrorObj(): { message: string; status: number } {
        return {
            status: this.status,
            message: this.message
        }
    }
}

export class NoJwtInTheHeaderError implements IErrorObj {
    status: number;
    message: string;
    constructor() {
        this.status = 401;
        this.message = Message.noJwtInTheHeader_message
    }
    getErrorObj(): { message: string; status: number } {
        return {
            status: this.status,
            message: this.message
        }
    }
}

export class VerifyAndAuthenticateError implements IErrorObj {
    status: number;
    message: string;
    constructor() {
        this.status = 401;
        this.message = Message.verifyAndAuthenticate_message
    }
    getErrorObj(): { message: string; status: number } {
        return {
            status: this.status,
            message: this.message
        }
    }
}

export class IncorrectInputError implements IErrorObj {
    status: number;
    message: string;
    constructor() {
        this.status = 400;
        this.message = Message.incorrectParameter_message
    }
    getErrorObj(): { message: string; status: number } {
        return {
            status: this.status,
            message: this.message
        }
    }
}

export class PayloadHeaderError implements IErrorObj {
    status: number;
    message: string;
    constructor() {
        this.status = 415;
        this.message = Message.incorrectPayloadHeader_messsage
    }
    getErrorObj(): { message: string; status: number } {
        return {
            status: this.status,
            message: this.message
        }
    }
}

export class AuthHeaderError implements IErrorObj {
    status: number;
    message: string;
    constructor() {
        this.status = 400;
        this.message = Message.noAuthHeader_message
    }
    getErrorObj(): { message: string; status: number } {
        return {
            status: this.status,
            message: this.message
        }
    }
}

export class RouteNotFoundError implements IErrorObj {
    status: number;
    message: string;
    constructor() {
        this.status = 404;
        this.message = Message.notFound_message;
    }
    getErrorObj(): { message: string; status: number } {
        return {
            status: this.status,
            message: this.message
        }
    }
}

export class ZeroTokensError implements IErrorObj {
    status: number;
    message: string;
    constructor() {
        this.status = 401;
        this.message = Message.zeroTokens_message
    }
    getErrorObj(): { message: string; status: number } {
        return {
            status: this.status,
            message: this.message
        }
    }
}

export enum EnumError {
    NotEnoughTokens,
    UserDoesNotExist,
    UserAlreadyExists,
    UserNotAdmin,
    MalformedPayload,
    InternalServerError,
    NoJwtInTheHeaderError,
    VerifyAndAuthenticateError,
    IncorrectInputError,
    PayloadHeaderError,
    AuthHeaderError,
    RouteNotFoundError,
    ZeroTokensError
}

/**
 * Funzione 'getError'
 * 
 * Funzione per creare l'istanza della classe corrispondente
 * all'errore che si è verificato.
 * 
 * @param type Tipo di errore che si è verificato
 */

export function getError(type: EnumError): IErrorObj {
  switch (type) {
    case EnumError.NotEnoughTokens:
      return new NotEnoughTokens();
    case EnumError.UserDoesNotExist:
      return new UserDoesNotExist();
    case EnumError.UserNotAdmin:
      return new UserNotAdmin();
    case EnumError.MalformedPayload:
      return new MalformedPayload();
    case EnumError.InternalServerError:
      return new InternalServerError();
    case EnumError.NoJwtInTheHeaderError:
      return new NoJwtInTheHeaderError();
    case EnumError.VerifyAndAuthenticateError:
      return new VerifyAndAuthenticateError();
    case EnumError.IncorrectInputError:
      return new IncorrectInputError();
    case EnumError.PayloadHeaderError:
      return new PayloadHeaderError();
    case EnumError.AuthHeaderError:
      return new AuthHeaderError();
    case EnumError.RouteNotFoundError:
      return new RouteNotFoundError();
    case EnumError.ZeroTokensError:
      return new ZeroTokensError();
    default:
      throw new Error(`Tipo di errore sconosciuto: ${type}`);
  }
}
