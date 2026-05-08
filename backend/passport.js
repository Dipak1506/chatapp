const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { Client } = require("pg");

// ─── Reuse your existing DB connection ───────────────────────────────────────
const connection = new Client({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    port: 5432,
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "db",
});
connection.connect((err) => {
    if (err) console.error("Passport DB connect error:", err);
});

// ─── Serialize / Deserialize ──────────────────────────────────────────────────

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const result = await connection.query(
            "SELECT * FROM userdata WHERE id = $1",
            [id]
        );
        done(null, result.rows[0] || null);
    } catch (err) {
        done(err, null);
    }
});

// ─── Google OAuth 2.0 Strategy ───────────────────────────────────────────────
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.REACT_APP_API_URL
                ? `${process.env.REACT_APP_API_URL}/auth/google/callback`
                : "http://localhost:5500/auth/google/callback",
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                const displayName = profile.displayName;
                const googleId = profile.id;

                // 1. Check if the user already exists (by google_id OR email)
                const existing = await connection.query(
                    "SELECT * FROM userdata WHERE google_id = $1 OR email = $2",
                    [googleId, email]
                );

                if (existing.rows.length > 0) {
                    // User already in DB — if google_id wasn't set yet, fill it in
                    const user = existing.rows[0];
                    if (!user.google_id) {
                        await connection.query(
                            "UPDATE userdata SET google_id = $1 WHERE id = $2",
                            [googleId, user.id]
                        );
                    }
                    return done(null, user);
                }


                const username = displayName.toLowerCase().replace(/\s+/g, "_");

                const insert = await connection.query(
                    `INSERT INTO userdata (name, email, username, google_id)
                     VALUES ($1, $2, $3, $4)
                     RETURNING *`,
                    [displayName, email, username, googleId]
                );

                return done(null, insert.rows[0]);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

module.exports = passport;