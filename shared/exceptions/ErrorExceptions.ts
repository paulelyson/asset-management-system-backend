type StatusCode =
  | 400 // Bad Request
  | 404 // Not Found
  | 401 // Unauthorized
  | 500; // Internal Server Error

interface IErrorException {
  statusCode: StatusCode;
  errors?: string[];
}

class ErrorException extends Error implements IErrorException {
  statusCode: StatusCode = 500;
  errors?: string[] = [];
  message: string = 'Internal Server Error';

  constructor(errors?: string[], message?: string, statusCode?: StatusCode) {
    super();
    this.statusCode = statusCode || this.statusCode;
    this.message = message || this.message;
    this.errors = errors || this.errors;
  }
}
