import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANTE: Não escreva lógica de redirecionamento entre getUser() e o return.
    // Isso pode fazer o middleware refrescar a sessão corretamente.
    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // Proteger rotas /pro e /client - redirecionar para /login se não autenticado
    if (!user && (pathname.startsWith('/pro') || pathname.startsWith('/client'))) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Se o usuário está logado e tenta acessar /login, manda para o dashboard correto
    if (user && pathname === '/login') {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

        const url = request.nextUrl.clone()
        if (profile?.role === 'professional') {
            url.pathname = '/pro'
            return NextResponse.redirect(url)
        } else if (profile?.role === 'client') {
            url.pathname = '/client'
            return NextResponse.redirect(url)
        }
        // Se cair aqui (profile null), não redireciona! 
        // Deixa a página carregar para que o fallback de criação de perfil no client-side funcione.
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
