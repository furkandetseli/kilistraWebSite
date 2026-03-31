# Kilistra Sanal Rehber

Konya Meram'daki Kilistra Antik Kenti / Gökyurt Köyü için profesyonel sanal rehber web sitesi.

---

## Görsel Ekleme Rehberi

Tüm görseller **tek dosyadan** (`data/data.json`) yönetilir.

### Adımlar

1. Görseli uygun klasöre koy (aşağıdaki tablo)
2. `data/data.json` dosyasında ilgili `"image"` satırını güncelle
3. Tarayıcıda yenile — bitti!

### Görsel Klasörleri

| Klasör | Ne için |
|--------|---------|
| `assets/images/` | Ana görseller (hero, intro, galeri hero vb.) |
| `assets/images/places/` | Mekan fotoğrafları (sandikkaya.jpg, sumbul.jpg vb.) |
| `assets/images/gallery/` | Galeri fotoğrafları (g1.jpg, g2.jpg …) |
| `assets/images/gallery/thumbs/` | Galeri küçük resimleri (isteğe bağlı) |
| `assets/images/tarih/` | Tarih sayfası görselleri |
| `assets/images/pratik/` | Pratik bilgiler sayfası görselleri |

### data.json'da Hangi Alanlar Görsel Kabul Eder?

```
hero.image                         → Ana sayfa hero
intro.image                        → Ana sayfa tanıtım fotoğrafı
featured_places[n].image           → Öne çıkan mekan kartları
places.items[n].image              → Keşfet sayfası mekan görselleri
gallery.items[n].src               → Galeri fotoğrafları
history.hero_image                 → Tarih sayfası hero
history.timeline[n].image          → Zaman çizelgesi görselleri
history.paul_section.image         → Aziz Pavlus bölümü
history.findings.items[n].image    → Arkeolojik bulgular
practical.hero_image               → Pratik bilgiler hero
practical.accommodation.items[n].image → Konaklama görselleri
contact.hero_image                 → İletişim sayfası hero
```

---

## Çalıştırma

Dosyaları doğrudan tarayıcıda açabilirsiniz. Ancak `data.json` fetch için **yerel sunucu** önerilir:

```bash
# Python ile
python -m http.server 8080

# Node.js ile (npx)
npx serve .
```

Sonra `http://localhost:8080` adresini açın.

---

## Teknoloji

- Saf HTML / CSS / Vanilla JS
- Google Fonts (Cinzel + Inter)
- AOS.js (animasyonlar)
- Leaflet.js (interaktif harita)
