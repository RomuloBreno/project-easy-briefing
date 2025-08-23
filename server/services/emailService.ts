// services/emailService.ts

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export class EmailService {
    private transporter: Transporter;
    private readonly senderEmailAddress: string;
    private readonly senderEmailPassword: string;

    constructor() {
        this.senderEmailAddress = process.env.SENDER_EMAIL_ADDRESS || '';
        this.senderEmailPassword = process.env.SENDER_EMAIL_PASSWORD || '';

        // Verificação de segurança em tempo de execução
        if (!this.senderEmailAddress || !this.senderEmailPassword) {
            throw new Error('As variáveis de ambiente para o e-mail do remetente e a senha não estão configuradas.');
        }
    }

    public async nodemailerreateTransport() {
        // Configurações SMTP da Hostinger
        this.transporter = await nodemailer.createTransport({
            host: 'smtp.hostinger.com',
            port: 465,
            secure: true,
            auth: {
                user: this.senderEmailAddress,
                pass: this.senderEmailPassword,
            },
        });
        
    }
    /**
     * @description Envia um e-mail de boas-vindas para um novo usuário.
     * @param {string} recipientEmail O e-mail do usuário que receberá a mensagem.
     * @param {string} name O nome do usuário para personalização do e-mail.
     * @param {string} link O link de autenticação.
    */
   public async sendWelcomeEmail(recipientEmail: string, name: string, link: string): Promise<void> {
        await this.nodemailerreateTransport(); 
        try {
            const mailOptions = {
                from: `"IzyBriefing" <${this.senderEmailAddress}>`,
                to: recipientEmail,
                subject: 'Bem-vindo(a) à nossa plataforma!',
                html: `
                    <h3>Olá, ${name}!</h3>
                    <p>Seu cadastro foi realizado com sucesso. Estamos muito felizes em ter você conosco!</p>
                    <p>Aproveite nossa plataforma</p>
                    <p>Aqui seu link para autenticação</p>
                    <p><a href="${link}">Link</p>
                    <br/>
                    <p>Atenciosamente,</p>
                    <p>IzyBriefing</p>
                `,
            };

            await this.transporter.sendMail(mailOptions);
            
        } catch (error) {
            console.error('Erro ao enviar o e-mail:', error);
            throw new Error('Não foi possível enviar o e-mail de boas-vindas.');
        }
    }

    /**
     * @description Envia um e-mail para redefinição de senha.
     * @param {string} recipientEmail O e-mail do usuário que receberá a mensagem.
     * @param {string} link O link para redefinir a senha.
     */
    public async sendEmailResetPass(recipientEmail: string, link: string): Promise<void> {
        await this.nodemailerreateTransport(); 
        try {
            const mailOptions = {
                from: `"IzyBriefing" <${this.senderEmailAddress}>`,
                to: recipientEmail,
                subject: 'Redefinição de Senha',
                html: `
                    <h3>Olá,</h3>
                    <p>Aqui está seu link para refazer a senha</p>
                    <p><a href="${link}">Link</p>
                    <br/>
                    <p>Atenciosamente,</p>
                    <p>IzyBriefing</p>
                `,
            };

            await this.transporter.sendMail(mailOptions);
            
        } catch (error) {
            console.error('Erro ao enviar o e-mail:', error);
            throw new Error('Não foi possível enviar o e-mail de Reset');
        }
    }

    /**
     * @description Envia um e-mail após uma compra.
     * @param {string} recipientEmail O e-mail do usuário que receberá a mensagem.
     */
    public async sendEmailAfterPurchase(recipientEmail: string): Promise<void> {
        await this.nodemailerreateTransport(); 
        try {
            const mailOptions = {
                from: `"IzyBriefing" <${this.senderEmailAddress}>`,
                to: "soulsfixconsulting@gmail.com", // O e-mail do destinatário está fixo aqui.
                subject: 'Novo membro com plano pago',
                html: `
                    <h3>Olá, novo membro com plano pago<h3>
                    <p>E-mail do novo membro: ${recipientEmail}</p>
                    <br/>
                    <p>Atenciosamente,</p>
                    <p>IzyBriefing</p>
                `,
            };

            await this.transporter.sendMail(mailOptions);
            
        } catch (error) {
            console.error('Erro ao enviar o e-mail:', error);
            throw new Error('Não foi possível enviar o e-mail de novo membro');
        }
    }
}