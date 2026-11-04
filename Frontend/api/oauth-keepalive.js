/* global process */

/**
 * Mantiene activo el cliente OAuth de Google que usa el login de admin.
 *
 * Google borra los clientes sin actividad durante 6 meses, y una sesión ya
 * abierta en Firebase no cuenta como actividad. Por eso un cron de Vercel
 * (ver vercel.json) canjea una vez por mes un refresh token por un access
 * token. El access token se descarta: lo único que importa es el canje.
 *
 * Variables de entorno en Vercel:
 * - GOOGLE_OAUTH_CLIENT_SECRET
 * - GOOGLE_OAUTH_REFRESH_TOKEN
 * - CRON_SECRET (Vercel la manda sola en el header Authorization)
 */

// El client ID es público: viaja en la URL de inicio de sesión con Google.
const GOOGLE_CLIENT_ID =
  '843280075054-87mqb2g4eef5her362of9n77rr2ake9m.apps.googleusercontent.com';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export default async function handler(req, res) {
  const { CRON_SECRET, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN } = process.env;

  if (!CRON_SECRET || req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  if (!GOOGLE_OAUTH_CLIENT_SECRET || !GOOGLE_OAUTH_REFRESH_TOKEN) {
    console.error('oauth-keepalive: faltan variables de entorno');
    return res.status(500).json({ ok: false, error: 'missing_env' });
  }

  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_OAUTH_CLIENT_SECRET,
        refresh_token: GOOGLE_OAUTH_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const { error = 'unknown_error' } = await response.json().catch(() => ({}));
      console.error(`oauth-keepalive: Google respondió ${response.status} (${error})`);
      return res.status(502).json({ ok: false, error });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('oauth-keepalive: no se pudo contactar a Google', error.message);
    return res.status(502).json({ ok: false, error: 'network_error' });
  }
}
