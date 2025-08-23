// services/emailService.ts

import nodemailer from 'nodemailer';

// As credenciais do seu e-mail devem ser armazenadas em variáveis de ambiente
const SENDER_EMAIL_ADDRESS = process.env.SENDER_EMAIL_ADDRESS;
const SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD;

// Verificação de segurança em tempo de execução
if (!SENDER_EMAIL_ADDRESS || !SENDER_EMAIL_PASSWORD) {
    throw new Error('As variáveis de ambiente para o e-mail do remetente e a senha não estão configuradas.');
}

// Configurações SMTP da Hostinger (com base na imagem fornecida)
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, // true para porta 465, false para outras
    auth: {
        user: SENDER_EMAIL_ADDRESS,
        pass: SENDER_EMAIL_PASSWORD,
    },
});

/**
 * @description Envia um e-mail de boas-vindas para um novo usuário.
 * @param {string} recipientEmail O e-mail do usuário que receberá a mensagem.
 * @param {string} name O nome do usuário para personalização do e-mail.
 */
export async function sendWelcomeEmail(recipientEmail: string, name: string, link:string): Promise<void> {
    try {
        const mailOptions = {
            from: `"IzyBriefing" <${SENDER_EMAIL_ADDRESS}>`,
            to: recipientEmail,
            subject: 'Bem-vindo(a) à nossa plataforma!',
            html: `
                <h3>Olá, ${name}!</h3>
                <p>Seu cadastro foi realizado com sucesso. Estamos muito felizes em ter você conosco!</p>
                <p>Aproveite nossa plataforma</p>
                <p>Aqui seu link para autenticação</p>
                <p>${link}</p>
                <br/>
                <p>Atenciosamente,</p>
                <p>IzyBriefing</p>
            `,
        };

       await transporter.sendMail(mailOptions);
        
    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
        throw new Error('Não foi possível enviar o e-mail de boas-vindas.');
    }
}
/**
 * @description Envia um e-mail de boas-vindas para um novo usuário.
 * @param {string} recipientEmail O e-mail do usuário que receberá a mensagem.
 * @param {string} name O nome do usuário para personalização do e-mail.
 */
export async function sendEmailResetPass(recipientEmail: string,link:string): Promise<void> {
    try {
        const mailOptions = {
            from: `"IzyBriefing" <${SENDER_EMAIL_ADDRESS}>`,
            to: recipientEmail,
            subject: 'Bem-vindo(a) à nossa plataforma!',
            html: `
                <h3>Olá,<h3>
                <p>Aqui esta seu link para refazer a senha</p>
                <p>${link}</p>
                <br/>
                <p>Atenciosamente,</p>
                <p>IzyBriefing</p>
            `,
        };

       await transporter.sendMail(mailOptions);
        
    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
        throw new Error('Não foi possível enviar o e-mail de Reset');
    }
}
/**
 * @description Envia um e-mail de boas-vindas para um novo usuário.
 * @param {string} recipientEmail O e-mail do usuário que receberá a mensagem.
 * @param {string} name O nome do usuário para personalização do e-mail.
 */
export async function sendEmailAfterPurchase(recipientEmail: string): Promise<void> {
    try {
        const mailOptions = {
            from: `"IzyBriefing" <${SENDER_EMAIL_ADDRESS}>`,
            to: "romulo.breno12@gmail.com",
            subject: 'Bem-vindo(a) à nossa plataforma!',
            html: `
                <h3>Olá, novo membro com plano pago<h3>
                ${recipientEmail}
                <br/>
                <p>Atenciosamente,</p>
                <p>IzyBriefing</p>
            `,
        };

       await transporter.sendMail(mailOptions);
        
    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
        throw new Error('Não foi possível enviar o e-mail de novo membro');
    }
}