import { Injectable } from '@nestjs/common';
import * as mailClient from 'node-mailjet';
import { User } from '../../entities/user.entity';

enum EmailTemplate {
    Confirmation = 610692,
    ForgotPassword = 610442,
}

@Injectable()
export class EmailService {
    private client = mailClient.connect('a95f2a2f245378381faa561dba502bb2', '0e2b5d269a5c6505b92f7b68915e1a9f', {
        url: 'api.mailjet.com',
        version: 'v3.1',
    });
    private webUrl = 'http://localhost:5000/';

    private async sendMail(subject: string, templateID: number, recipient: string, Variables = {}) {
        return await this.client.post('send').request({
            Messages: [{
                From: {
                    Email: 'armenvardanyan95@gmail.com',
                    Name: 'yur',
                },
                Subject: subject,
                TemplateID: templateID,
                TemplateLanguage: true,
                To: [{Email: recipient}],
                Variables,
        }]});
    }

    async sendConfirmationEmail(recipient: string, confirmationLink) {
        const confirmation_link = `${this.webUrl}confirm?token=${confirmationLink}`;
        return await this.sendMail('Your confirmation is here', EmailTemplate.Confirmation, recipient, {confirmation_link});
    }

    async sendPasswordRecoveryEmail(user: User, token: string) {
        const recovery_link = `${this.webUrl}recover?token=${token}`;
        return await this.sendMail('Your password recovery is here', EmailTemplate.ForgotPassword, user.email, {
            recovery_link,
            user_name: user.firstName + ' ' + user.lastName,
        });
    }
}