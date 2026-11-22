// App Store nusxasi uchun www/index.html ni moslash.
// App Store qoidasiga ko'ra ilova o'zini tashqaridan yangilashni (APK yuklab olish) taklif qilmasligi kerak:
// «Янги версия чиқди» xabari va «Янгиланишни текшириш» tugmasi o'chiriladi (Play nusxasidagi bilan bir xil).
// Ishlatish: node ios-patch.mjs www/index.html
import { readFileSync, writeFileSync } from 'node:fs';

const f = process.argv[2] || 'www/index.html';
let h = readFileSync(f, 'utf8');

// Majburiy almashtirishlar: topilmasa, yig'ish to'xtaydi.
const required = [
  ['async function checkUpdate(manual){', 'async function checkUpdate(manual){ return null;'],
  ["${/^\\d/.test(TUHR_VERSION)?'<div class=\"tzbtns\"><button class=\"btn\" type=\"button\" id=\"tzUpd\">Янгиланишни текшириш</button></div>':''}", ''],
];
// Ixtiyoriy almashtirishlar: iPhone foydalanuvchisi uchun tabiiyroq matn.
const optional = [
  ['Уни Google Drive ёки Telegram «Сақланганлар»га юбориб қўйинг.', 'Уни iCloud Drive ёки Telegram «Сақланганлар»га юбориб қўйинг.'],
];

for (const [a, b] of required) {
  if (!h.includes(a)) { console.error("::error::iOS uchun o'zgartiriladigan joy topilmadi: " + a.slice(0, 60)); process.exit(1); }
  h = h.split(a).join(b);
}
for (const [a, b] of optional) {
  if (h.includes(a)) h = h.split(a).join(b);
  else console.log("::warning::Ixtiyoriy matn topilmadi (o'zgartirilmadi): " + a.slice(0, 40));
}

// Tekshiruv: foydalanuvchiga ko'rinadigan matnlarda Android / Google Play / APK so'zlari qolmasligi kerak.
// Izohlar (/* */ va //) va kod ichidagi o'zgaruvchi nomlari hisobga olinmaydi — faqat qo'shtirnoq ichidagi matnlar.
const noComments = h.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
const strings = noComments.match(/(['"`])(?:\\.|(?!\1)[^\\\n])*\1/g) || [];
const bad = strings.filter(s => /Android|Андроид|Google Play|Play Market|Плей ?маркет|\bAPK\b/i.test(s) && !/^['"`]data:/.test(s));
if (bad.length) {
  console.error('::error::iOS nusxasida Android/Play/APK haqidagi matn qoldi:');
  bad.slice(0, 10).forEach(s => console.error('  ' + s.slice(0, 160)));
  process.exit(1);
}

writeFileSync(f, h);
console.log("iOS nusxasi tayyor: yangilanish xabari o'chirildi, Android/Play matnlari yo'q.");
