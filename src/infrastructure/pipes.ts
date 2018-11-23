import { HttpException, Injectable, PipeTransform, HttpStatus } from '@nestjs/common';

import { Schema } from './schemas';

@Injectable()
export class ValidationPipe implements PipeTransform {

    constructor(private readonly schema: Schema, private readonly exclude: any[] = []) {}

    transform(value) {
        if (this.exclude.filter(exclusion => value instanceof exclusion).length) {
            return value;
        }
        const errors = this.schema.validate(value);
        if (errors.length) {
            throw new HttpException({status: HttpStatus.UNPROCESSABLE_ENTITY, error: JSON.stringify(errors)}, 422);
        } else {
            return value;
        }
    }
}