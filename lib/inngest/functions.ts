import {inngest} from "@/lib/inngest/client";
import {PERSONALIZED_WELCOME_EMAIL_PROMPT, NEWS_SUMMARY_EMAIL_PROMPT} from "@/lib/inngest/prompts";
import {sendWelcomeEmail, sendNewsSummaryEmail} from "@/lib/nodemailer";
import {getAllUsersForNewsEmail} from "@/lib/actions/user.actions";
import {getWatchlistSymbolsByEmail} from "@/lib/actions/watchlist.actions";
import {getNews} from "@/lib/actions/finnhub.actions";

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
    [ {event: 'app/send.daily.news'}, {cron: 'TZ=Asia/Kolkata 53 11 * * *'}],
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