'use strict';
/*
 * Applies VooSquare's native settings after `npx cap add <platform>` and `npx capacitor-assets generate`.
 * Run in CI: node scripts/prepare.js android|ios
 * Safe to run twice (every change checks before it edits).
 *
 * Env (all optional):
 *   APP_VERSION   marketing version, e.g. 1.0.0        (default: package.json version)
 *   BUILD_NUMBER  integer build / versionCode           (default: 1)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const VERSION = process.env.APP_VERSION || pkg.version;
const BUILD = String(Math.max(1, parseInt(process.env.BUILD_NUMBER || '1', 10) || 1));
const platform = process.argv[2];

const read = (f) => fs.readFileSync(f, 'utf8');
const write = (f, s) => fs.writeFileSync(f, s);
const must = (cond, what) => { if (!cond) { console.error('prepare.js: could not ' + what); process.exit(1); } };
const log = (s) => console.log('prepare.js: ' + s);

function android() {
  const gradle = path.join(ROOT, 'android/app/build.gradle');
  must(fs.existsSync(gradle), 'find android/app/build.gradle (run npx cap add android first)');
  let g = read(gradle);

  // Version name and code.
  g = g.replace(/versionCode\s+\d+/, `versionCode ${BUILD}`).replace(/versionName\s+"[^"]*"/, `versionName "${VERSION}"`);
  must(g.includes(`versionCode ${BUILD}`) && g.includes(`versionName "${VERSION}"`), 'set the Android version');

  // Release signing, only when the upload key is provided (GitHub secrets). Without it the release build is unsigned
  // and the debug APK is still made for testing.
  if (!g.includes('VOOSQUARE_SIGNING')) {
    g = g.replace(/android\s*\{/, `android {
    // VOOSQUARE_SIGNING: the Play upload key comes from the environment (GitHub secrets), never from the repository.
    signingConfigs {
        release {
            if (System.getenv("ANDROID_KEYSTORE_FILE")) {
                storeFile file(System.getenv("ANDROID_KEYSTORE_FILE"))
                storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
                keyAlias System.getenv("ANDROID_KEY_ALIAS")
                keyPassword System.getenv("ANDROID_KEY_PASSWORD")
            }
        }
    }`);
    g = g.replace(/buildTypes\s*\{\s*release\s*\{/, `buildTypes {
        release {
            if (System.getenv("ANDROID_KEYSTORE_FILE")) { signingConfig signingConfigs.release }`);
    must(g.includes('signingConfig signingConfigs.release'), 'add release signing to build.gradle');
  }
  write(gradle, g);
  log(`android version ${VERSION} (${BUILD})`);

  // Voice lessons play slide after slide: let the web view start the next clip without a new tap.
  const javaDir = path.join(ROOT, 'android/app/src/main/java');
  const main = findFile(javaDir, 'MainActivity.java');
  must(main, 'find MainActivity.java');
  let m = read(main);
  if (!m.includes('setMediaPlaybackRequiresUserGesture')) {
    m = m.replace(/public class MainActivity extends BridgeActivity\s*\{\s*\}/, `public class MainActivity extends BridgeActivity {
    @Override
    public void onStart() {
        super.onStart();
        // Lesson narration moves from clip to clip on its own after the member presses play.
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
        }
    }
}`);
    must(m.includes('setMediaPlaybackRequiresUserGesture'), 'patch MainActivity.java');
    write(main, m);
  }

  // Manifest: no cleartext traffic.
  const manifest = path.join(ROOT, 'android/app/src/main/AndroidManifest.xml');
  let x = read(manifest);
  if (!x.includes('android:usesCleartextTraffic')) {
    x = x.replace('<application', '<application\n        android:usesCleartextTraffic="false"');
    write(manifest, x);
  }
  log('android ready');
}

function ios() {
  const plistFile = path.join(ROOT, 'ios/App/App/Info.plist');
  must(fs.existsSync(plistFile), 'find ios/App/App/Info.plist (run npx cap add ios first)');
  let p = read(plistFile);
  const setKey = (key, xmlValue) => {
    const re = new RegExp(`<key>${key}</key>\\s*<[^>]+>[^<]*</[^>]+>|<key>${key}</key>\\s*<(true|false)/>`);
    if (re.test(p)) p = p.replace(re, `<key>${key}</key>\n\t${xmlValue}`);
    else p = p.replace(/<dict>/, `<dict>\n\t<key>${key}</key>\n\t${xmlValue}`);
  };
  setKey('CFBundleDisplayName', '<string>VooSquare</string>');
  setKey('ITSAppUsesNonExemptEncryption', '<false/>');
  // Profile pictures and support screenshots: the web file picker can open the camera or the photo library.
  setKey('NSCameraUsageDescription', '<string>VooSquare uses the camera only when you choose to take a photo for your profile or a support message.</string>');
  setKey('NSPhotoLibraryUsageDescription', '<string>VooSquare opens your photos only when you choose a picture for your profile or a support message.</string>');
  setKey('NSPhotoLibraryAddUsageDescription', '<string>VooSquare saves your student card or certificate to your photos when you ask it to.</string>');
  write(plistFile, p);

  // iPhone only (no iPad layout or iPad screenshots needed), version and build number.
  const pbx = path.join(ROOT, 'ios/App/App.xcodeproj/project.pbxproj');
  must(fs.existsSync(pbx), 'find project.pbxproj');
  let x = read(pbx);
  x = x.replace(/TARGETED_DEVICE_FAMILY = "1,2";/g, 'TARGETED_DEVICE_FAMILY = 1;');
  x = x.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${VERSION};`);
  x = x.replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${BUILD};`);
  write(pbx, x);
  log(`ios version ${VERSION} (${BUILD}), iPhone only`);
}

function findFile(dir, name) {
  if (!fs.existsSync(dir)) return null;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) { const r = findFile(f, name); if (r) return r; } else if (e.name === name) return f;
  }
  return null;
}

if (platform === 'android') android();
else if (platform === 'ios') ios();
else { console.error('usage: node scripts/prepare.js android|ios'); process.exit(1); }
