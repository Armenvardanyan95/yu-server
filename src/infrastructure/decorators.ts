import { createParamDecorator } from '@nestjs/common';

export const CurrentUser = createParamDecorator(async (data, req) => req.user[0]);