# VooSquare mobile (Android + iPhone)

Capacitor app around https://voosquare.com/app. **Start with [MOBILE-GUIDE.md](MOBILE-GUIDE.md).**

- Store text and answers: [store/LISTING.md](store/LISTING.md) · graphics: `store/google/`, `store/apple/`
- Builds: GitHub Actions → **Android** (test APK + Play AAB) and **iOS** (checks + TestFlight upload when the Apple secrets are set)
- Native settings: `capacitor.config.json`, `scripts/prepare.js` · icons and splash: `resources/` (made with `tools/render.js`)
