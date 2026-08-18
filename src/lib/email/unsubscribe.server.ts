// Shared helper: get or create the unsubscribe token required by the email API
// for every transactional send.

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function getOrCreateUnsubscribeToken(
  supabase: any,
  email: string,
): Promise<string> {
  const normalizedEmail = email.toLowerCase()

  const { data: existing, error: lookupError } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (lookupError) throw new Error('Failed to look up unsubscribe token')
  if (existing?.token) return existing.token

  const token = generateToken()
  const { error: insertError } = await supabase
    .from('email_unsubscribe_tokens')
    .upsert({ token, email: normalizedEmail }, { onConflict: 'email', ignoreDuplicates: true })

  if (insertError) throw new Error('Failed to create unsubscribe token')

  const { data: stored } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (!stored?.token) throw new Error('Failed to confirm unsubscribe token')
  return stored.token
}
