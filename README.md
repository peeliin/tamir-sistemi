# Elektronik Tamir Sistemi

Telefon, PC ve tablet tamir kayıtlarını yönetmek ve müşterilerin cihaz durumunu takip etmek için React tabanlı teknik servis uygulaması.

## Özellikler

- **Admin paneli:** Cihaz kaydı, durum güncelleme, fiyat belirleme, onaya gönderme, tamir/teslim
- **Müşteri takibi:** Referans no + şifre ile giriş, durum timeline'ı, fiyat onayı/reddi
- **Veri saklama:** Tarayıcı `localStorage` (prototip aşaması)

## Kurulum

```bash
npm install
npm start
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde açılır.

### Admin girişi (varsayılan)

| Alan | Değer |
|------|-------|
| Kullanıcı adı | `admin` |
| Şifre | `admin123` |

Özelleştirmek için `.env.example` dosyasını `.env` olarak kopyalayıp `REACT_APP_ADMIN_USER` ve `REACT_APP_ADMIN_PASS` değerlerini değiştirin.

## Sayfa yapısı

| URL | Açıklama |
|-----|----------|
| `/` | Müşteri girişi |
| `/admin/giris` | Admin girişi |
| `/admin` | Admin paneli (oturum gerekli) |
| `/takip` | Müşteri cihaz takibi (giriş sonrası) |

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm start` | Geliştirme sunucusu |
| `npm test` | Testleri çalıştır |
| `npm run build` | Production build |
| `npm run lint` | ESLint kontrolü |

## Proje yapısı

```
src/
├── App.js                 # Rotalar ve global state
├── pages/
│   ├── Login.jsx          # Müşteri / admin girişi
│   ├── Status.jsx         # Admin paneli
│   ├── NewDevice.jsx      # Yeni cihaz kaydı
│   └── CustomerStatus.jsx # Müşteri takip ekranı
├── components/            # Navbar, Alert, modal...
├── utils/                 # storage, validasyon, referans yardımcıları
└── config/auth.js         # Admin oturum ayarları

database/                  # PostgreSQL şeması (henüz bağlı değil)
├── schema.sql
├── sample_data.sql
└── DATABASE.md
```

## Veritabanı

`database/` klasöründe production için hazırlanmış PostgreSQL şeması bulunur. Frontend şu an veritabanına bağlanmaz; tüm veriler tarayıcıda saklanır. Kurulum ve detaylar için [`database/DATABASE.md`](database/DATABASE.md) dosyasına bakın.

## Notlar

- Bu sürüm bir **prototip**tir; müşteri şifreleri `localStorage`'da düz metin olarak tutulur.
- Production kullanımı için backend API ve PostgreSQL entegrasyonu gerekir.
