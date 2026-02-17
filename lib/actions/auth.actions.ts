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
            }
        })
        if(response){
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
        }

        return {
            success: true, message: 'User created successfully', data: response
        }
    }catch(e){
        console.log('Sign up failed',e)
        return {success: false, error: 'Sign up failed'}
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