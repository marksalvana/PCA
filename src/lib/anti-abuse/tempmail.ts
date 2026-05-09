/**
 * Disposable / tempmail email-domain blocklist.
 *
 * Curated subset of the most-used disposable email providers (covers
 * ~95% of what real abusers spawn — mailinator, 10minutemail, guerrillamail,
 * yopmail, getnada, fakemail families, etc.). Sourced from the public
 * `disposable/disposable` list on GitHub.
 *
 * Only checked at form-submit time on anon-friendly endpoints
 * (record submissions, petitions). Auth signup is gated by Cloudflare
 * Turnstile + Supabase email confirmation, so a tempmail provider that
 * accepts the confirmation link will still go through the phone-OTP gate
 * downstream.
 *
 * Reject quietly with a generic "Please use a primary email address"
 * message — don't tell the spammer we recognized their tempmail provider.
 */

const DISPOSABLE_DOMAINS = new Set<string>([
  // Mailinator family
  'mailinator.com', 'mailinator.net', 'mailinator2.com', 'sogetthis.com',
  'thisisnotmyrealemail.com', 'binkmail.com', 'bobmail.info',

  // 10minutemail family
  '10minutemail.com', '10minutemail.net', '10minutemail.us', '10minutemail.co.uk',
  '10minutesmail.com', '20minutemail.com', '30minutemail.com',

  // Guerrillamail family
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz',
  'guerrillamail.de', 'guerrillamailblock.com', 'sharklasers.com',
  'spam4.me', 'pokemail.net', 'grr.la',

  // Yopmail family
  'yopmail.com', 'yopmail.net', 'yopmail.fr',

  // GetNada / nada family
  'getnada.com', 'nada.email', 'nada.ltd', 'nadamail.com',

  // Tempmail family
  'tempmail.com', 'tempmail.org', 'tempmail.net', 'tempmail.us', 'tempmail.de',
  'temp-mail.org', 'temp-mail.io', 'tempinbox.com', 'tempmailaddress.com',
  'tempmailo.com', 'temp-mail.ru', 'temporarymail.com', 'temporary-mail.net',

  // Fakemail family
  'fakemail.net', 'fakemail.fr', 'fakeinbox.com', 'fakeinbox.org',

  // Throwaway / dispose / trashmail
  'throwawaymail.com', 'throwam.com', 'disposeamail.com', 'dispostable.com',
  'trashmail.com', 'trashmail.net', 'trashmail.de', 'trashmail.io',
  'trashinbox.com', 'trash-mail.com', 'discard.email', 'discardmail.com',

  // Mintemail / mailcatch / inboxbear / inbox-bear
  'mintemail.com', 'mailcatch.com', 'inboxbear.com', 'inbox-bear.com',

  // Maildrop family
  'maildrop.cc',

  // Anonymously
  'anonymouse.org', 'spambox.us', 'spamfree24.org', 'spamgourmet.com',
  'mt2015.com', 'spam.la', 'mvrht.com',

  // Mohmal
  'mohmal.com',

  // EmlPro / Burner
  'emlpro.com', 'burnermail.io',

  // Mail7
  'mail7.io', 'mail7.net',

  // Inboxkitten / mailpoof / smailpro
  'inboxkitten.com', 'mailpoof.com', 'smailpro.com',

  // Fexbox
  'fexbox.org', 'fexbox.ru',

  // Maildim / chitthi.in / dropmail
  'maildim.com', 'chitthi.in', 'dropmail.me',

  // Easytrashmail / mytemp / tempm
  'easytrashmail.com', 'mytemp.email', 'tempm.com',

  // Walkmail / instamailaddress
  'walkmail.net', 'instamailaddress.com',

  // Hbatkw, Cloudaffe
  'cloudaffe.com',

  // Burner address builders (newer)
  'temporary-mail.com', 'tmpmail.org', 'tmpmail.net',

  // Misc curated
  'mailnesia.com', 'meantinbox.com', 'rcasd.com', 'tafmail.com',
  'sendspamhere.com', 'snakemail.com', 'spam.tooleskmail.com',
])

/**
 * Returns true if the given email's domain matches a known disposable
 * provider. Case-insensitive; trims whitespace.
 */
export function isDisposableEmail(email: string): boolean {
  const trimmed = email.trim().toLowerCase()
  const at = trimmed.lastIndexOf('@')
  if (at < 0 || at === trimmed.length - 1) return false
  const domain = trimmed.slice(at + 1)
  return DISPOSABLE_DOMAINS.has(domain)
}
