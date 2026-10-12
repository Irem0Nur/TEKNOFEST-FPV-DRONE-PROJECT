# GROUP GİM — Web Sitesi

TEKNOFEST FPV Drone İzleme yarışması için GROUP GİM ekibinin web sitesi. Saf HTML, CSS ve JavaScript ile yazıldı; kurulum veya derleme gerekmez.

**Canlı site:** https://teknofest-fpv-drone-project.onrender.com

`main` dalına yapılan her push, Render tarafından birkaç dakika içinde otomatik olarak yayına alınır.

## Çalıştırma

Dosyaları çift tıklayarak açmak yerine küçük bir yerel sunucuyla açın. 3D model ve bazı animasyonlar ancak böyle çalışır.

- **VS Code:** "Live Server" eklentisini kurun, `index.html` üzerinde sağ tık → **Open with Live Server**.
- **Python:** Proje klasöründe `python -m http.server 8000` çalıştırıp tarayıcıda http://localhost:8000 adresini açın.

## Klasör yapısı

```
index.html             Ana sayfa
hakkimizda.html        Hakkımızda
ekip.html              Ekip + Ekibe Katıl formu
yarisma.html           Yarışma
teknik.html            Teknik
sponsorluk.html        Sponsorluk + Sponsor formu
iletisim.html          İletişim + İletişim formu + Medya kiti
kvkk.html              KVKK Aydınlatma Metni

css/style.css          Ortak tasarım sistemi (renkler, yazı tipleri, menü, alt bilgi)
css/home.css           Ana sayfaya özel stiller (paket kartları, kayan logo bandı)
css/pages.css          Alt sayfalara özel stiller ve formlar (mobil düzen dahil)

js/site.js             Menü, alt bilgi, geri sayım, TR/EN geçişi, arka plan anka ve nişangâhlar
js/intro.js            "Küllerinden doğan anka" giriş animasyonu
js/hero-feed.js        Ana sayfadaki canlı "kamera görüntüsü" takip animasyonu
js/drone3d.js          3D drone (three.js)
js/home.js             Kayan logo bandı
js/forms.js            Form doğrulama ve gönderimi (FormSubmit)

assets/                Logo, favicon, arka plan görselleri, TEKNOFEST logosu

googled6eeb766d9ea0d84.html   Google Search Console doğrulama dosyası (SİLMEYİN)
sitemap.xml            Site haritası (Google için sayfa listesi)
robots.txt             Arama motorlarına site haritasının yerini bildirir
```

## Sık yapılacak değişiklikler

| Ne | Nerede |
|---|---|
| Renkler | `css/style.css` → en üstteki `:root` bölümü (`--cherry` vb.) |
| Menü sekmeleri ve alt başlıklar | `js/site.js` → `NAV` |
| Alt bilgideki e-posta ve sosyal medya bağlantıları | `js/site.js` → `CONFIG` |
| Final tarihi (geri sayım) | `js/site.js` → `CONFIG.finalDate` |
| Formların gönderildiği e-posta | `js/forms.js` → `FORM_ENDPOINT` ve `FALLBACK_EMAIL` |
| Kayan banttaki sponsor logoları | `index.html` → `marquee-track` içindeki `slot` kutucukları |
| Yeni sayfa eklendiğinde | Sayfayı `js/site.js` → `NAV` ve `sitemap.xml` dosyasına da ekleyin |

## Dil sistemi (TR / EN)

Sitenin metinleri yalnızca **Türkçe** yazılır. EN düğmesine basıldığında sayfa, Google Translate ile Türkçeden İngilizceye **otomatik** çevrilir. Bu yüzden bir metni değiştirdiğinizde İngilizcesiyle uğraşmanıza gerek yoktur.

- Çevrilmemesi gereken bir yazı varsa (ürün veya paket adı gibi), etiketine `translate="no"` ekleyin:
  ```html
  <h3 translate="no">Altın Kanat</h3>
  ```
- Menü, alt bilgi, geri sayım ve form uyarıları gibi JavaScript ile yazılan metinlerin İngilizcesi kodun içindedir (`js/site.js`, `js/forms.js`, `js/hero-feed.js`).
- HTML'deki eski `data-en="..."` öznitelikleri artık metin için kullanılmıyor. Kalmaları sorun değil.
- Google bu ücretsiz çeviri aracını resmi olarak desteklemiyor. Bir gün EN düğmesi Türkçe göstermeye başlarsa, sebep büyük ihtimalle budur.

## Git ile çalışma

Ekip aynı depo üzerinde çalıştığı için sıralama önemli: **önce commit, sonra pull, en son push.**

```bash
git add .
git commit -m "Ne değiştiğini anlatan kısa bir açıklama"
git pull --rebase
git push
```

- Çalışmaya başlamadan önce `git pull --rebase` ile ekibin son değişikliklerini alın.
- `git pull --rebase` sırasında **CONFLICT** çıkarsa başka komut çalıştırmadan ekiple birlikte çözün.
- `.vscode/` klasörünü commit'lemeyin; kişisel editör ayarlarıdır.

## Google Search Console

Site, Google Search Console'a eklendi ve doğrulandı.

- `googled6eeb766d9ea0d84.html` dosyası doğrulamanın devam etmesi için gereklidir. **Silmeyin, adını değiştirmeyin.**
- Site haritası Search Console → **Site Haritaları** bölümüne `sitemap.xml` olarak gönderilir.
- Yeni bir sayfa eklendiğinde `sitemap.xml` dosyasına o sayfanın satırını ekleyin.

## Notlar

- Giriş animasyonunu tekrar görmek için tarayıcı sekmesini kapatıp yeniden açın. Animasyon her oturumda bir kez oynar.
- Site; dil tercihini ve giriş animasyonunun izlenip izlenmediğini yalnızca ziyaretçinin kendi tarayıcısına kaydeder. Ayrıntılar `kvkk.html` içinde.