#!/usr/bin/env bash
# iOS (Xcode) loyihasini yaratish va sozlash. macOS'da, ombor ildizidan ishga tushiriladi.
# www/ papkasi (tayyor veb-sahifa) oldindan joyida bo'lishi kerak.
# Ishlatish: bash .github/ios/prepare.sh <version> <build> [team_id]
set -euo pipefail
VERSION="$1"; BUILD="$2"; TEAM="${3:-}"
HERE=.github/ios
[ -f www/index.html ] || { echo "::error::www/index.html topilmadi"; exit 1; }

echo "== Xcode / vositalar"
xcodebuild -version
pod --version
node --version

echo "== Capacitor sozlamalari"
cp "$HERE/package.json" package.json
cp "$HERE/capacitor.config.json" capacitor.config.json
mkdir -p assets
cp icon.png assets/icon.png
cp icon.png assets/logo.png

echo "== Kutubxonalar"
npm install --no-audit --no-fund

echo "== iOS loyihasi"
npx cap add ios

echo "== Ikonka va ochilish ekrani"
npx @capacitor/assets generate --ios \
  --iconBackgroundColor '#F5DDE5' --iconBackgroundColorDark '#1A1017' \
  --splashBackgroundColor '#F5DDE5' --splashBackgroundColorDark '#1A1017' \
  || echo "::warning::@capacitor/assets ishlamadi — ochilish ekrani standart holicha qoladi."
# App Store ikonkasi: 1024x1024, shaffoflik (alpha) kanalisiz bo'lishi shart.
# Asl icon.png to'liq ishlatiladi; JPEG orqali o'tkazib alpha kanali olib tashlanadi.
ICONSET=ios/App/App/Assets.xcassets/AppIcon.appiconset
rm -f "$ICONSET"/*.png
sips -s format jpeg -s formatOptions 100 -z 1024 1024 icon.png --out "$RUNNER_TEMP/icon.jpg" >/dev/null
sips -s format png "$RUNNER_TEMP/icon.jpg" --out "$ICONSET/AppIcon-512@2x.png" >/dev/null
cat > "$ICONSET/Contents.json" <<'JSON'
{
  "images" : [
    { "filename" : "AppIcon-512@2x.png", "idiom" : "universal", "platform" : "ios", "size" : "1024x1024" }
  ],
  "info" : { "author" : "xcode", "version" : 1 }
}
JSON
sips -g pixelWidth -g pixelHeight -g hasAlpha "$ICONSET/AppIcon-512@2x.png"
if sips -g hasAlpha "$ICONSET/AppIcon-512@2x.png" | grep -q 'hasAlpha: yes'; then echo "::error::Ikonkada alpha kanali qoldi"; exit 1; fi

echo "== Fayllarni ko'chirish (cap sync)"
npx cap sync ios

echo "== Xcode loyihasini sozlash"
cp "$HERE/PrivacyInfo.xcprivacy" ios/App/App/PrivacyInfo.xcprivacy
ruby "$HERE/configure.rb" ios/App/App.xcodeproj "$VERSION" "$BUILD" "$TEAM"

echo "== Info.plist"
PL=ios/App/App/Info.plist
plutil -replace CFBundleDisplayName -string "Туҳр" "$PL"
plutil -replace ITSAppUsesNonExemptEncryption -bool NO "$PL"
# Namoz vaqtlari uchun joylashuv (WKWebView navigator.geolocation) — faqat tugma bosilganda so'raladi
plutil -replace NSLocationWhenInUseUsageDescription -string "Намоз вақтларини турган жойингиз бўйича ҳисоблаш учун жойлашув керак. Жойлашув фақат шу телефонда сақланади ва ҳеч қаерга юборилмайди." "$PL"
plutil -replace UIRequiredDeviceCapabilities -json '["arm64"]' "$PL"
plutil -replace UISupportedInterfaceOrientations -json '["UIInterfaceOrientationPortrait"]' "$PL"
plutil -remove 'UISupportedInterfaceOrientations~ipad' "$PL" 2>/dev/null || true
plutil -lint "$PL"
plutil -p "$PL"

echo "== Tekshiruv: plaginlar iOS loyihasida bormi"
cat ios/App/App/capacitor.config.json
grep -n "pod '" ios/App/Podfile
for p in CapacitorLocalNotifications CapacitorPreferences CapacitorFilesystem CapacitorHaptics CapacitorShare CapacitorApp; do
  grep -q "$p" ios/App/Podfile || { echo "::error::$p plagini Podfile'da yo'q"; exit 1; }
done
grep -q 'LocalNotificationsPlugin' ios/App/App/capacitor.config.json || { echo "::error::LocalNotificationsPlugin ro'yxatda yo'q"; exit 1; }
grep -q 'return null;' ios/App/App/public/index.html || { echo "::error::Yangilanish xabari o'chirilmagan"; exit 1; }
echo "Tayyor: $VERSION ($BUILD)"
