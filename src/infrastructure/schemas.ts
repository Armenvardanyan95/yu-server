export class Validation {
    constructor(public readonly validate: (value: any) => boolean | string) {}
}

interface IValidationError {
    fieldName: string;
    errorMessages: string[];
}

export class Schema {
    constructor(private readonly fields: [string, Validation[]][]) {}

    validate(obj: any): IValidationError[] {
        return this.fields.map(field => {
           const [name, validations] = field;
           const singleFieldErrorMessages = [];
           validations.forEach((validation: Validation) => {
               const validationResult = validation.validate(obj[name]);
               if (validationResult !== true) {
                   singleFieldErrorMessages.push(validationResult);
               }
           });

           if (singleFieldErrorMessages.length) {
               return {fieldName: name, errorMessages: singleFieldErrorMessages};
           }
        }).filter(error => error);
    }
}

export class Validations {
    static readonly Required = new Validation((field: string) => field && field !== '' ? true : 'Field is required');
    static readonly Email = new Validation((field: string) => /[^@]+@[^\.]+\..+/.test(field) ? true : 'This is not a valid email');
}