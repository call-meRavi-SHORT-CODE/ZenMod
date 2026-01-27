import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const allCookies = cookieStore.getAll()
          console.log('[supabase-server] getAll cookies:', allCookies.map(c => c.name));
          return allCookies
        },
        setAll(cookiesToSet) {
          console.log('[supabase-server] setAll cookies:', cookiesToSet.map(c => c.name));
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // ...
          }
        },
      },
    }
  )
}
