'use server';

import {auth} from "@/lib/better-auth/auth";
import {inngest} from "@/lib/inngest/client";
import {headers} from "next/headers";

export const signUpWithEmail = async({email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry}: SignUpFormData) => {
    try{
        const response = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: fullName
            },
            headers: await headers()
        })
        
        if(!response) {
            return {success: false, error: 'Failed to create account'};
        }
        
        try{
            await inngest.send({
                name: 'app/user.created',
                data: {
                    email,
                    name: fullName,
                    country,
                    investmentGoals,
                    riskTolerance,
                    preferredIndustry
                }
            })
        }catch(inngestError){
            console.log('Inngest failed but user created:', inngestError);
        }

        return {
            success: true, message: 'User created successfully', data: response
        }
    }catch(e){
        console.error('Sign up failed:',e)
        const errorMessage = e instanceof Error ? e.message : 'Sign up failed';
        return {success: false, error: errorMessage}
    }
}

export const signInWithEmail = async({email, password }: SignInFormData) => {
    try{
        const response = await auth.api.signInEmail({
            body: {
                email,
                password

            }
        })

        if(!response) {
            return {success: false, error: 'Invalid credentials'}
        }

        return {
            success: true, data: response
        }
    }catch(e){
        console.log('Sign in failed',e)
        return {success: false, error: 'Invalid email or password'}
    }
}

export const signOut = async() => {
    try{
        await auth.api.signOut({headers: await headers()});
    }catch(e){
        console.log('sign out failed', e)
            return {success: false, error:'Sign Out failed'}
    }
}