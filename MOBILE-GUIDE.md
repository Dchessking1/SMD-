# VooSquare on Google Play and the App Store: the full guide

Who does what: **Ejiro** (accounts, store forms, pressing submit) · **Ademola** (deploy, secrets, testing).
The apps load the live site (https://voosquare.com/app), so every website update reaches the apps instantly. A new store
build is only needed when the icon, splash screen, name or native settings change.

---

## Step 0: Deploy the website update first (Ademola)

Deploy the latest **voosquare-app.zip**. It adds what both stores require:
- **Delete account** (Profile → Delete account, and the public page /delete-account)
- **Report and Block** in the community, plus the **Reports** tab in Admin → Community
- **App review account** (Admin → Settings → General): the store reviewers' sign-in
- **No selling inside the apps:** in the iPhone and Android apps, Premium prices and buy buttons are hidden (members buy on the website)

Migrations 012 and 013 run by themselves. Tests: 1810 passed.

---

## Step 1: Accounts (Ejiro): start today

### 1a. D-U-N-S number (free, needed by Apple for a company account; Google asks for it too)
1. Go to https://developer.apple.com/enroll/duns-lookup/ and search for **Zedapex Limited**.
2. If it isn't found, request one there (free). Use the exact legal name and the address on the CAC registration.
3. It usually arrives in 5–10 working days by email.

### 1b. Google Play Console ($25 once)
1. https://play.google.com/console/signup → choose **Organization** (not "Yourself").
2. Organization name: **Zedapex Limited**, plus the D-U-N-S number, website https://voosquare.com and a contact email and phone.
3. Pay $25 and verify identity when asked. Approval usually takes 1–3 days.
   (Company accounts don't need the "12 testers for 14 days" test that new personal accounts must do.)

### 1c. Apple Developer Program ($99 a year)
1. Install the **Apple Developer** app on an iPhone (easiest) or go to https://developer.apple.com/programs/enroll/
2. Enroll as **Organization**: Zedapex Limited, with the D-U-N-S number and a work email on your domain if possible.
3. Apple may phone to verify. Approval usually takes 1–3 days after the D-U-N-S is ready.

---

## Step 2: Android builds (Ademola): can be done now

The builds run on GitHub (Actions tab). Every push makes:
- **VooSquare-test.apk** (artifact *voosquare-android-test-apk*): install it on any Android phone to test today.
  On the phone: download it → open → allow "Install unknown apps" for the browser/files app → Install.
- **VooSquare.aab** (artifact *voosquare-android-release*): the file for the Play Store.

**Sign the release (once):** Ejiro has the upload key file and a text file with its passwords (sent privately).
GitHub → the repository → Settings → Secrets and variables → Actions → **New repository secret**, four times:

| Secret name | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | everything in `voosquare-upload.jks.base64.txt` |
| `ANDROID_KEYSTORE_PASSWORD` | from the text file |
| `ANDROID_KEY_ALIAS` | `voosquare-upload` |
| `ANDROID_KEY_PASSWORD` | from the text file |

Then Actions → **Android** → Run workflow. The new `VooSquare.aab` is signed and ready for Play.
Optional: Settings → Variables → `APP_VERSION` = `1.0.0` (raise it for each store release; the build number goes up by itself).

---

## Step 3: iPhone builds (Ademola, after Apple approves the account)

Every push already checks that the iPhone app builds, and makes a Simulator build (artifact *voosquare-ios-simulator*). To sign it and send it to TestFlight:

1. **App Store Connect → Apps → + → New App**: Platform iOS, Name **VooSquare: Media Buying**, language English,
   Bundle ID: register **com.zedapex.voosquare** first at developer.apple.com → Identifiers → + (App IDs → App), SKU `voosquare-ios`.
2. **App Store Connect → Users and Access → Integrations → App Store Connect API → +**: name "GitHub builds",
   access **Admin**. Download the `.p8` key (it downloads only once) and note the **Key ID** and **Issuer ID**.
3. **Team ID**: developer.apple.com → Membership details.
4. GitHub → Settings → Secrets → Actions, four secrets:

| Secret name | Value |
|---|---|
| `APPSTORE_API_KEY_ID` | Key ID |
| `APPSTORE_API_ISSUER_ID` | Issuer ID |
| `APPSTORE_API_KEY_P8` | the whole text of the .p8 file, including the BEGIN/END lines |
| `APPLE_TEAM_ID` | Team ID |

5. Actions → **iOS** → Run workflow. When it's green, the build appears in App Store Connect → TestFlight after Apple
   processes it (5–30 minutes). Add yourselves as internal testers and install it with the **TestFlight** app.

---

## Step 4: Store listings (Ejiro, with the files in `store/`)

Everything to copy is in **store/LISTING.md**: names, descriptions, keywords, privacy answers, age rating answers and reviewer notes.
Graphics: `store/google/` (icon 512, feature graphic, 7 phone screenshots) and `store/apple/` (7 iPhone 6.9" screenshots, icon 1024).

**Before submitting, set the reviewer sign-in:** VooSquare Admin → Settings → General → **App review account**
(e.g. review@voosquare.com + a 6-digit code). Put the same email and code in both stores (see LISTING.md).

### Google Play
1. Create app → name, default language English, App, Free.
2. **App content**: privacy policy URL, App access (reviewer sign-in), Ads (No), Content rating (questionnaire answers in LISTING.md),
   Target audience **18+**, Data safety (answers in LISTING.md), and **account deletion URL** https://voosquare.com/delete-account.
3. **Main store listing**: paste the text and upload the graphics.
4. **Production** (or **Internal testing** first) → Create release → upload `VooSquare.aab` → Save → Review → **Start rollout**.

### App Store
1. In the app's version page: paste the text, upload screenshots, set the category, age rating and App Privacy (answers in LISTING.md).
2. Pricing: **Free**. Availability: all countries you want.
3. Pick the TestFlight build, fill App Review Information (sign-in + notes) → **Add for Review → Submit**.

---

## What the apps do (for the reviewers' questions)
- Load https://voosquare.com/app with a native splash screen, VooSquare icon and a branded offline screen.
- VooSquare and VooSquare Academy pages open inside the app; every other link opens in the phone's browser.
- The apps tell the site they are the app (user agent "VooSquareApp/1.0 (ios|android)"), so the site hides selling.
- Lesson narration plays from clip to clip after one tap (Android setting in MainActivity).
- Camera and photo access are asked for only when a member picks a picture (profile, support).

## Later (update two)
- **Push notifications** need a free Firebase project (Google) and an Apple push key. Ask Claude when ready.
- Offline lessons (download a lesson with its voice).
