require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const { getUser, getUserByUsername, upsertUser } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

const {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI,
    SESSION_SECRET,
} = process.env;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
    session({
        secret: SESSION_SECRET || 'dev-secret-change-me',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, // 7 days
    })
);

// ---------- Helpers ----------

function avatarUrl(discordUser) {
    if (!discordUser.avatar) {
        // default discord avatar based on discriminator/id
        const idx = discordUser.discriminator && discordUser.discriminator !== '0'
            ? Number(discordUser.discriminator) % 5
            : Number(BigInt(discordUser.id) >> 22n) % 6;
        return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
    }
    const ext = discordUser.avatar.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${ext}?size=256`;
}

function avatarDecorationUrl(discordUser) {
    // This is the REAL profile frame Discord shows around a user's avatar.
    if (discordUser.avatar_decoration_data && discordUser.avatar_decoration_data.asset) {
        return `https://cdn.discordapp.com/avatar-decoration-presets/${discordUser.avatar_decoration_data.asset}.png`;
    }
    return null;
}

function bannerUrl(discordUser) {
    if (!discordUser.banner) return null;
    const ext = discordUser.banner.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/banners/${discordUser.id}/${discordUser.banner}.${ext}?size=600`;
}

function requireAuth(req, res, next) {
    if (!req.session.discordId) return res.redirect('/');
    next();
}

// ---------- Auth routes ----------

app.get('/auth/discord', (req, res) => {
    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'code',
        scope: 'identify',
    });
    res.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
});

app.get('/auth/discord/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.redirect('/?error=no_code');

    try {
        // Step 1: exchange the code for an access token (server-side only, uses the secret)
        const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: DISCORD_REDIRECT_URI,
            }),
        });
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) {
            console.error('Token exchange failed:', tokenData);
            return res.redirect('/?error=token_exchange_failed');
        }

        // Step 2: fetch the real Discord profile (avatar, decoration, banner, username)
        const userRes = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const discordUser = await userRes.json();

        // Step 3: store/update our local profile record, seeded with real Discord data
        const existing = getUser(discordUser.id);
        upsertUser(discordUser.id, {
            discordUsername: discordUser.username,
            globalName: discordUser.global_name,
            avatar: discordUser.avatar,
            avatarDecoration: discordUser.avatar_decoration_data || null,
            banner: discordUser.banner,
            bannerColor: discordUser.banner_color,
            customUsername: existing?.customUsername || discordUser.username,
            settings: existing?.settings || defaultSettings(),
        });

        req.session.discordId = discordUser.id;
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.redirect('/?error=server_error');
    }
});

app.post('/auth/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

// ---------- Default settings shape ----------

function defaultSettings() {
    return {
        displayName: '',
        bio: '',
        location: '',
        usernameEffect: 'none',   // none | rainbow | glitch | typewriter
        bioEffect: 'none',        // none | rainbow | glitch | typewriter
        backgroundType: 'color',  // color | gradient | image | video
        backgroundColor: '#0a0a0f',
        backgroundGradientFrom: '#2e1065',
        backgroundGradientTo: '#000000',
        backgroundImageUrl: '',
        backgroundVideoUrl: '',
        backgroundEffect: 'none', // none | particles | snow | stars
        glow: {
            username: false,
            description: false,
            location: false,
            socials: false,
        },
        socials: [], // [{platform: 'discord', url: '...'}]
    };
}

// ---------- Dashboard (protected) ----------

app.get('/dashboard', requireAuth, (req, res) => {
    const user = getUser(req.session.discordId);
    if (!user) return res.redirect('/');
    res.render('dashboard', {
        user,
        avatarUrl: avatarUrl({ id: user.discordId, avatar: user.avatar, discriminator: '0' }),
        avatarDecorationUrl: avatarDecorationUrl({ avatar_decoration_data: user.avatarDecoration }),
        bannerUrl: user.banner ? bannerUrl({ id: user.discordId, banner: user.banner }) : null,
    });
});

app.post('/api/save', requireAuth, (req, res) => {
    const user = getUser(req.session.discordId);
    if (!user) return res.status(401).json({ error: 'not logged in' });

    const incoming = req.body;
    const settings = {
        ...defaultSettings(),
        ...user.settings,
        ...incoming,
        glow: { ...defaultSettings().glow, ...(user.settings?.glow || {}), ...(incoming.glow || {}) },
    };

    const updated = upsertUser(user.discordId, {
        customUsername: incoming.customUsername || user.customUsername,
        settings,
    });
    res.json({ ok: true, user: updated });
});

// ---------- Public profile page ----------

app.get('/u/:username', (req, res) => {
    const user = getUserByUsername(req.params.username);
    if (!user) return res.status(404).send('Profile not found');

    res.render('profile', {
        user,
        avatarUrl: avatarUrl({ id: user.discordId, avatar: user.avatar, discriminator: '0' }),
        avatarDecorationUrl: avatarDecorationUrl({ avatar_decoration_data: user.avatarDecoration }),
        bannerUrl: user.banner ? bannerUrl({ id: user.discordId, banner: user.banner }) : null,
        settings: { ...defaultSettings(), ...user.settings },
    });
});

// ---------- Landing ----------

app.get('/', (req, res) => {
    const loggedIn = Boolean(req.session.discordId);
    const user = loggedIn ? getUser(req.session.discordId) : null;
    res.render('index', { loggedIn, user });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
        console.warn('⚠️  DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET not set — copy .env.example to .env and fill them in.');
    }
});
