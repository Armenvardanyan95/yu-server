import { ApiModelProperty } from '@nestjs/swagger';

export class UserModelDto {
    @ApiModelProperty({required: false})
    id?: number;

    @ApiModelProperty()
    firstName: string;

    @ApiModelProperty()
    lastName: string;

    @ApiModelProperty()
    email: string;

    @ApiModelProperty()
    password: string;

    @ApiModelProperty()
    confirmPassword: string;

    @ApiModelProperty({required: false})
    bio?: string;

    @ApiModelProperty({required: false})
    phoneNumber?: string;
}

export interface IOrder {
    title: string;
    description: string;
    user: UserModelDto;
}

export interface  IJwtPayload {
    email: string;
    isAdmin: boolean;
}

export class SignInOptionsDto {
    @ApiModelProperty()
    email: string;

    @ApiModelProperty()
    password: string;
}

export class UserVerifyDto {
    @ApiModelProperty()
    token: string;
}

export class ForgotPasswordDto {
    @ApiModelProperty()
    email: string;
}

export class UpdatePasswordDto {
    @ApiModelProperty()
    currentPassword: string;

    @ApiModelProperty()
    newPassword: string;
}
