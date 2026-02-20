import {inngest} from "@/lib/inngest/client";
import {PERSONALIZED_WELCOME_EMAIL_PROMPT, NEWS_SUMMARY_EMAIL_PROMPT} from "@/lib/inngest/prompts";
import {sendWelcomeEmail, sendNewsSummaryEmail} from "@/lib/nodemailer";
import {getAllUsersForNewsEmail} from "@/lib/actions/user.actions";
import {getWatchlistSymbolsByEmail} from "@/lib/actions/watchlist.actions";
import {getNews} from "@/lib/actions/finnhub.actions";
import {connectToDatabase} from "@/database/mongoose";
import {Alert} from "@/database/models/alert.model";
import {AlertNotification} from "@/database/models/alertNotification.model";
import {STOCK_ALERT_UPPER_EMAIL_TEMPLATE, STOCK_ALERT_LOWER_EMAIL_TEMPLATE} from "@/lib/nodemailer/template";
import nodemailer from 'nodemailer';

export const sendSignUpEmail = inngest.createFunction(
    {id: 'sign-up-email'},
    {event: 'app/user.created'},
    async ({event, step}) => {
        const userProfile = `
        - Country: ${event.data.country}
        - Investment goals: ${event.data.investmentGoals}
        - Risk tolerance: ${event.data.riskTolerance}
        - Preferred industry: ${event.data.preferredIndustry}
        `

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}',userProfile)

        const response = await step.ai.infer('generate-welcome-intro', {
            model: step.ai.models.gemini({model: 'gemini-2.5-flash-lite'}),
                body: {
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                }

        })

        await step.run('send-welcome-email', async()=> {
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introText = (part && 'text' in part ? part.text : null) || 'Thanks for joining La Bolsa. You now have the tools to track markets and make smarter moves.'

            const {data: { email, name }} = event;
            return await sendWelcomeEmail({email, name, intro: introText})
        })

        return {
            success: true,
            message: 'Welcome email sent successfully'
        }
    }
)

export const sendDailyNewsSummary = inngest.createFunction(
    { id: 'daily-news-summary' },
    [ {event: 'app/send.daily.news'}, {cron: 'TZ=Asia/Kolkata 57 12 * * *'}],
    async ({step}) => {
        const users = await step.run('get-all-users', getAllUsersForNewsEmail);
        if (!users || users.length === 0) return { success: false, message: 'No users found' };

        for (const user of users) {
            const symbols = await step.run(`get-watchlist-${user.id}`, async () => 
                await getWatchlistSymbolsByEmail(user.email)
            );

            const news = await step.run(`fetch-news-${user.id}`, async () => {
                const articles = await getNews(symbols.length > 0 ? symbols : undefined);
                return articles.slice(0, 6);
            });

            const summary = await step.ai.infer(`summarize-news-${user.id}`, {
                model: step.ai.models.gemini({model: 'gemini-2.5-flash-lite'}),
                body: {
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(news))
                                }
                            ]
                        }
                    ]
                }
            });

            await step.run(`send-news-email-${user.id}`, async () => {
                const part = summary.candidates?.[0]?.content?.parts?.[0];
                const newsContent = (part && 'text' in part ? part.text : null) || '<p>No news available today.</p>';
                return await sendNewsSummaryEmail({email: user.email, name: user.name, newsContent});
            });
        }

        return { success: true };
    }
)

export const checkPriceAlerts = inngest.createFunction(
    { id: 'check-price-alerts' },
    { cron: '0 * * * *' },
    async ({ step }) => {
        const users = await step.run('get-all-users', getAllUsersForNewsEmail);
        if (!users || users.length === 0) return { success: false };

        for (const user of users) {
            const alerts = await step.run(`get-alerts-${user.id}`, async () => {
                await connectToDatabase();
                const alertsList = await Alert.find({ userId: user.id }).lean();
                return JSON.parse(JSON.stringify(alertsList));
            });

            if (!alerts || alerts.length === 0) continue;

            for (const alert of alerts) {
                if (alert.triggered) continue;
                
                const quote = await step.run(`fetch-quote-${alert._id}`, async () => {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/quote/${alert.symbol}`);
                    return await res.json();
                });

                const triggered = alert.alertType === 'upper' 
                    ? quote.price >= alert.threshold
                    : quote.price <= alert.threshold;

                if (triggered) {
                    await step.run(`send-alert-email-${alert._id}`, async () => {
                        console.log(`Alert ${alert._id} triggered for ${alert.symbol}`);
                        
                        const template = alert.alertType === 'upper' ? STOCK_ALERT_UPPER_EMAIL_TEMPLATE : STOCK_ALERT_LOWER_EMAIL_TEMPLATE;
                        const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
                        
                        const html = template
                            .replace(/{{symbol}}/g, alert.symbol)
                            .replace(/{{company}}/g, alert.company)
                            .replace(/{{currentPrice}}/g, `$${quote.price.toFixed(2)}`)
                            .replace(/{{targetPrice}}/g, `$${alert.threshold.toFixed(2)}`)
                            .replace(/{{timestamp}}/g, timestamp);
                        
                        const subject = `🚨 Price Alert: ${alert.company} (${alert.symbol}) ${alert.alertType === 'upper' ? 'Above' : 'Below'} $${alert.threshold.toFixed(2)}`;
                        
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: process.env.NODEMAILER_EMAIL,
                                pass: process.env.NODEMAILER_PASSWORD,
                            },
                        });
                        
                        await transporter.sendMail({
                            from: process.env.NODEMAILER_EMAIL,
                            to: user.email,
                            subject,
                            html,
                        });

                        console.log(`Email sent for alert ${alert._id}`);

                        await connectToDatabase();
                        
                        await AlertNotification.create({
                            userId: user.id,
                            symbol: alert.symbol,
                            company: alert.company,
                            alertName: alert.alertName,
                            alertType: alert.alertType,
                            threshold: alert.threshold,
                            triggeredPrice: quote.price,
                            triggeredAt: new Date(),
                            read: false,
                        });

                        await Alert.deleteOne({ _id: alert._id });

                        console.log(`Alert ${alert._id} deleted and notification created`);

                        const { revalidatePath } = await import('next/cache');
                        revalidatePath('/watchlist');
                    });
                }
            }
        }

        return { success: true };
    }
)