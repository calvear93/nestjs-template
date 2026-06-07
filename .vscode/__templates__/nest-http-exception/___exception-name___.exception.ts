import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * ___ExceptionName___ HTTP exception.
 */
export class ___ExceptionName___HttpException extends HttpException {
	constructor() {
		super('___description___', HttpStatus.INTERNAL_SERVER_ERROR);
	}
}
