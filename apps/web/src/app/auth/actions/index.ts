"use server"

import createSupabaseServerClient from "@/utils/supabase/server";

export async function signInWithEmailAndPassword(data: {
    email: string;
    password: string;
}) {
    const supabase = await createSupabaseServerClient();
    const result = await supabase.auth.signInWithPassword({ 
        email: data.email, 
        password: data.password
    });

    return result;
}

export async function signUpWithEmailAndPassword(data: {
    email: string;
    password: string;
}) {
    const supabase = await createSupabaseServerClient();
    const result = await supabase.auth.signUp({ 
        email: data.email, 
        password: data.password, 
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`
        }
    });

    return result;
}

export async function signInWithOAuth(provider: 'google' | 'facebook') {
    const supabase = await createSupabaseServerClient();
    
    const result = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    });

    return result;
}

export async function resetPasswordForEmail(email: string) {
    const supabase = await createSupabaseServerClient();
    
    const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reset-password/update`,
    });

    return result;
}

export async function updatePassword(password: string) {
    const supabase = await createSupabaseServerClient();
    
    const result = await supabase.auth.updateUser({
        password,
    });

    return result;
}

export async function signOut() {
    const supabase = await createSupabaseServerClient();
    const result = await supabase.auth.signOut();
    return result;
}