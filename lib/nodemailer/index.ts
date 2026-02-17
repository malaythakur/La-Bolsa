import nodemailer from 'nodemailer';
import {WELCOME_EMAIL_TEMPLATE} from "@/lib/nodemailer/template";

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEMAILER_PASSWORD!,
    }
})

export const sendWelcomeEmail = async({email, name, intro}: WelcomeEmailData) => {
    const htmlTemplate =  WELCOME_EMAIL_TEMPLATE.replace('{{name}}', name).replace('{{intro}}', intro);

    const mailOptions = {
        from: `"CEO - La Bolsa"<malaythakur13@gmail.com`,
        to: email,
        subject: 'Welcome to La Bolsa - Your Gateway to Smart Investing',
        text: 'Thanks for joining La Bolsa',
        html: htmlTemplate,
    }
    await transporter.sendMail(mailOptions);
}
