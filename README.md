# GROUP GİM — Web Sitesi

TEKNOFEST FPV Drone İzleme yarışması için GROUP GİM ekibinin web sitesi.
Saf HTML, CSS ve JavaScript. Kurulum veya derleme gerekmez.

## Çalıştırma

Dosyaları çift tıklayarak açmak yerine küçük bir yerel sunucuyla açın (3D model ve bazı animasyonlar ancak böyle çalışır):

- **VS Code:** "Live Server" eklentisini kurun, `index.html` üzerinde sağ tık → *Open with Live Server*.
- **Python:** klasörde `python -m http.server 8000` çalıştırıp tarayıcıda `http://localhost:8000` açın.

## Klasör yapısı

```
index.html          Ana sayfa
hakkimizda.html     Hakkımızda
ekip.html           Ekip + Ekibe Katıl formu
yarisma.html        Yarışma
teknik.html         Teknik
sponsorluk.html     Sponsorluk + Sponsor formu
iletisim.html       İletişim
kvkk.html           KVKK Aydınlatma Metni
css/style.css       Ortak tasarım sistemi (renkler, yazı tipleri, menü, alt bilgi)
css/home.css        Ana sayfaya özel stiller
js/site.js          Menü, alt bilgi, TR/EN geçişi, arka plan anka ve nişangâhlar
js/intro.js         "Küllerinden doğan anka" giriş animasyonu
js/drone3d.js       3D drone (three.js)
js/home.js          Geri sayım, kayan logo bandı
assets/             Logo, favicon
```

## Sık yapılacak değişiklikler

| Ne | Nerede |
|---|---|
| Renkler | `css/style.css` en üstteki `:root` bölümü (`--cherry` vb.) |
| Menü sekmeleri ve alt başlıklar | `js/site.js` → `NAV` |
| E-posta ve sosyal medya bağlantıları | `js/site.js` → `CONFIG` |
| Final tarihi (geri sayım) | `js/home.js` → `FINAL_DATE` |
| İngilizce metinler | Her metnin `data-en="..."` özniteliği |

**Dil sistemi:** Türkçe metin HTML'in içine, İngilizcesi aynı etiketin `data-en` özniteliğine yazılır:

```html
<h2 data-en="Our Story">Hikâyemiz</h2>
```

**Giriş animasyonunu tekrar görmek için:** tarayıcı sekmesini kapatıp yeniden açın (oturumda bir kez oynar).
