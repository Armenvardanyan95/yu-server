import {
    Body, Controller, Get, Post, UseGuards, Query, Param, UsePipes, UseInterceptors,
    FileInterceptor, UploadedFile, Res
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../infrastructure/decorators';
import { ErrorResponse, SuccessResponse } from '../infrastructure/responses';
import { MessagesService } from './messages.service';
import { MessageModel } from './message.model';
import { MessagesGateway } from './messages.gateway';
import { User } from '../entities/user.entity';

@Controller('messages')
export class MessagesController {

    constructor(private messagesService: MessagesService, private messagesGateway: MessagesGateway) {}

    @Post('initiate-chat')
    @UseGuards(AuthGuard())
    async initiateChat(@CurrentUser() user, @Body() data) {
        try {
            const chat = await this.messagesService.initiateChat(data);
            return new SuccessResponse();

        } catch (error) {
            return new ErrorResponse(error.message);
        }
    }

    @Get()
    @UseGuards(AuthGuard())
    async getUserChats(@CurrentUser() user) {
        try {
            const chats = await this.messagesService.getUserChats(user);
            return new SuccessResponse(chats);
        } catch (error) {
            return new ErrorResponse(error.message);
        }
    }

    @Get('messages')
    @UseGuards(AuthGuard())
    async getMessages(@Query() params) {
        try {
            const messages = await this.messagesService.getMessagesFromChat(params.chatID, params.page);
            return new SuccessResponse(messages);
        } catch (error) {
            return new ErrorResponse(error.message);
        }
    }

    @Post()
    @UseGuards(AuthGuard())
    async addMessage(@Body() message, @CurrentUser() user) {
        const msg = new MessageModel(message.chat, message.content, user);
        try {
            const createdMessage = await this.messagesService.addMessage(msg);
            this.messagesGateway.addMessage(createdMessage as any);
            return new SuccessResponse(createdMessage);
        } catch (error) {
            return new ErrorResponse(error.message);
        }
    }

    @Get('mark-as-read/:id')
    @UseGuards(AuthGuard())
    async markAsRead(@Param('id') id) {
        try {
            const message = await this.messagesService.markAsRead(id);
            this.messagesGateway.markAsRead(message);
            return new SuccessResponse();
        } catch (error) {
            return new ErrorResponse(error.message);
        }
    }

    @Post('/attachment')
    @UseGuards(AuthGuard())
    @UseInterceptors(FileInterceptor('file'))
    async addAttachment(@Body() message, @CurrentUser() user: User, @UploadedFile() file) {
        try {
            const attachment = await this.messagesService.addMessage(new MessageModel(message.chat, '', user, file.filename));
            this.messagesGateway.addMessage(attachment as any);
            return new SuccessResponse(attachment);
        } catch (error) {
            return  new ErrorResponse(error.message);
        }
    }

    @Get('attachment/:docName')
    async getAttachment(@Param('docName') docName, @Res() res) {
        res.sendFile(docName, {root: 'public'});
    }
}