import nodemailer from 'nodemailer';
import {NEWS_SUMMARY_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE} from "@/lib/nodemailer/template";
import {getFormattedTodayDate} from "@/lib/utils";

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

export const sendNewsSummaryEmail = async({email, name, newsContent}: NewsSummaryEmailData) => {
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace('{{date}}', getFormattedTodayDate())
        .replace('{{newsContent}}', newsContent);

    const mailOptions = {
        from: `"La Bolsa News"<malaythakur13@gmail.com>`,
        to: email,
        subject: `Market News Summary - ${getFormattedTodayDate()}`,
        text: 'Your daily market news summary',
        html: htmlTemplate,
    }
    await transporter.sendMail(mailOptions);
}
