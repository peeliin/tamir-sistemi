-- =============================================================================
-- Tamir Sistemi — Örnek Veri (v2 uyumlu)
-- Önce schema.sql çalıştırılmalıdır.
--
-- Admin girişi (v2 Login.jsx):
--   Kullanıcı adı: admin
--   Şifre:         admin123
--
-- Müşteri girişi (v2 — referans no + kayıt şifresi):
--   Tüm örnek kayıtların şifresi: 1234
--
-- Referans numaraları (CIH-YYYYMMDD-NNNN):
--   CIH-20260520-0001  → Teslim Edildi (ödeme + yorum var)
--   CIH-20260605-0001  → Onay Bekliyor
--   CIH-20260601-0001  → Tamirde
--   CIH-20260528-0001  → Reddedildi
--   CIH-20260603-0001  → Hazır (teslim bekliyor)
-- =============================================================================

-- Sabit UUID'ler (test ve geliştirme için öngörülebilir)
-- Admin:     a0000000-0000-4000-8000-000000000001
-- Müşteri 1: b0000000-0000-4000-8000-000000000001  Ahmet Yılmaz
-- Müşteri 2: b0000000-0000-4000-8000-000000000002  Ayşe Demir
-- Müşteri 3: b0000000-0000-4000-8000-000000000003  Mehmet Kaya
-- Kayıt 1–5: c0000000-0000-4000-8000-000000000001 … 000005

-- bcrypt: admin123  → $2b$10$nCfzVoz27yc9pgNCGrqxD.YjnIs4dQJn4Q8LgfCZGdsszDweQWD7u
-- bcrypt: 1234      → $2b$10$euXhk1hQ3Ui.tp3jILZW5.IYwNVe8peVURptJQdHK4UaonxVlcn/m
-- bcrypt: password123 → $2b$10$4MeubuyF4twjQuQ2pxSyfuY.FWgR7f0.7D59vdwxmbUnlosVYxZ8O

-- -----------------------------------------------------------------------------
-- CİHAZ MODELLERİ
-- -----------------------------------------------------------------------------

INSERT INTO device_models (brand_id, name, device_type) VALUES
    (1, 'iPhone 11',       'Telefon'),
    (1, 'iPhone 13 Pro',   'Telefon'),
    (2, 'Galaxy S21',      'Telefon'),
    (2, 'Galaxy A54',      'Telefon'),
    (3, 'Redmi Note 12',   'Telefon'),
    (6, 'ThinkPad E14',    'PC'),
    (7, 'Pavilion 15',     'PC'),
    (8, 'VivoBook X515',   'PC');

-- -----------------------------------------------------------------------------
-- KULLANICILAR
-- role_id: 1 = admin, 2 = customer
-- -----------------------------------------------------------------------------

INSERT INTO users (id, role_id, username, email, phone, password_hash, full_name) VALUES
    (
        'a0000000-0000-4000-8000-000000000001',
        1,
        'admin',
        'admin@tamirservis.com',
        '05321234567',
        '$2b$10$nCfzVoz27yc9pgNCGrqxD.YjnIs4dQJn4Q8LgfCZGdsszDweQWD7u',
        'Servis Yöneticisi'
    ),
    (
        'b0000000-0000-4000-8000-000000000001',
        2,
        NULL,
        'ahmet.yilmaz@email.com',
        '05331111111',
        '$2b$10$4MeubuyF4twjQuQ2pxSyfuY.FWgR7f0.7D59vdwxmbUnlosVYxZ8O',
        'Ahmet Yılmaz'
    ),
    (
        'b0000000-0000-4000-8000-000000000002',
        2,
        NULL,
        'ayse.demir@email.com',
        '05332222222',
        '$2b$10$4MeubuyF4twjQuQ2pxSyfuY.FWgR7f0.7D59vdwxmbUnlosVYxZ8O',
        'Ayşe Demir'
    ),
    (
        'b0000000-0000-4000-8000-000000000003',
        2,
        NULL,
        'mehmet.kaya@email.com',
        '05333333333',
        '$2b$10$4MeubuyF4twjQuQ2pxSyfuY.FWgR7f0.7D59vdwxmbUnlosVYxZ8O',
        'Mehmet Kaya'
    );

INSERT INTO customer_profiles (user_id, address, city, notes) VALUES
    (
        'b0000000-0000-4000-8000-000000000001',
        'Atatürk Cad. No: 15 Daire: 3',
        'İstanbul',
        'Tercih: SMS bildirimi'
    ),
    (
        'b0000000-0000-4000-8000-000000000002',
        'Cumhuriyet Mah. 42. Sok. No: 8',
        'Ankara',
        NULL
    ),
    (
        'b0000000-0000-4000-8000-000000000003',
        'Kordon Boyu No: 120',
        'İzmir',
        'Kurumsal müşteri'
    );

-- -----------------------------------------------------------------------------
-- TAMİR KAYITLARI (v2 devices[] yapısı)
-- repair_status_id: 1=Cihaz Alındı 2=Beklemede 3=İnceleniyor 4=Onay Bekliyor
--                   5=Onaylandı 6=Reddedildi 7=Tamirde 8=Hazır 9=Teslim Edildi
-- Müşteri kayıt şifresi (customer_password_hash): hepsi "1234"
-- -----------------------------------------------------------------------------

INSERT INTO repair_requests (
    id, referans_no, ad_soyad, telefon, email, customer_password_hash,
    cihaz_turu, marka, model, ariza_not, islem, fiyat,
    current_status_id, customer_id, brand_id, device_model_id,
    repair_type_id, assigned_admin_id, admin_notes, final_price,
    received_at, delivered_at, created_at
) VALUES
    -- 1) Tamamlanmış kayıt
    (
        'c0000000-0000-4000-8000-000000000001',
        'CIH-20260520-0001',
        'Ahmet Yılmaz',
        '05331111111',
        'ahmet.yilmaz@email.com',
        '$2b$10$euXhk1hQ3Ui.tp3jILZW5.IYwNVe8peVURptJQdHK4UaonxVlcn/m',
        'Telefon', 'Apple', 'iPhone 11',
        'Ekran kırık, dokunmatik çalışıyor.',
        'Ekran değişimi (orijinal parça)',
        4500.00,
        9,
        'b0000000-0000-4000-8000-000000000001',
        1, 1, 1,
        'a0000000-0000-4000-8000-000000000001',
        'Orijinal parça kullanıldı.',
        4500.00,
        '2026-05-20 10:30:00+03',
        '2026-05-25 16:00:00+03',
        '2026-05-20 10:30:00+03'
    ),
    -- 2) Onay bekliyor
    (
        'c0000000-0000-4000-8000-000000000002',
        'CIH-20260605-0001',
        'Ayşe Demir',
        '05332222222',
        'ayse.demir@email.com',
        '$2b$10$euXhk1hQ3Ui.tp3jILZW5.IYwNVe8peVURptJQdHK4UaonxVlcn/m',
        'Telefon', 'Samsung', 'Galaxy S21',
        'Pil hızlı bitiyor, şişme yok.',
        'Pil değişimi',
        1200.00,
        4,
        'b0000000-0000-4000-8000-000000000002',
        2, 3, 2,
        'a0000000-0000-4000-8000-000000000001',
        'Pil değişimi önerildi.',
        NULL,
        '2026-06-05 14:00:00+03',
        NULL,
        '2026-06-05 14:00:00+03'
    ),
    -- 3) Tamirde
    (
        'c0000000-0000-4000-8000-000000000003',
        'CIH-20260601-0001',
        'Mehmet Kaya',
        '05333333333',
        'mehmet.kaya@email.com',
        '$2b$10$euXhk1hQ3Ui.tp3jILZW5.IYwNVe8peVURptJQdHK4UaonxVlcn/m',
        'PC', 'Lenovo', 'ThinkPad E14',
        'Laptop açılmıyor, fan sesi var.',
        'Anakart onarımı',
        3500.00,
        7,
        'b0000000-0000-4000-8000-000000000003',
        6, 6, 7,
        'a0000000-0000-4000-8000-000000000001',
        'Anakart onarımı devam ediyor.',
        NULL,
        '2026-06-01 09:15:00+03',
        NULL,
        '2026-06-01 09:15:00+03'
    ),
    -- 4) Reddedildi
    (
        'c0000000-0000-4000-8000-000000000004',
        'CIH-20260528-0001',
        'Ahmet Yılmaz',
        '05331111111',
        'ahmet.yilmaz@email.com',
        '$2b$10$euXhk1hQ3Ui.tp3jILZW5.IYwNVe8peVURptJQdHK4UaonxVlcn/m',
        'Telefon', 'Xiaomi', 'Redmi Note 12',
        'Ekran ve çerçeve hasarlı.',
        'Ekran ve çerçeve değişimi',
        2800.00,
        6,
        'b0000000-0000-4000-8000-000000000001',
        3, 5, 1,
        'a0000000-0000-4000-8000-000000000001',
        'Müşteri fiyatı yüksek buldu.',
        NULL,
        '2026-05-28 11:00:00+03',
        NULL,
        '2026-05-28 11:00:00+03'
    ),
    -- 5) Hazır — teslim bekliyor
    (
        'c0000000-0000-4000-8000-000000000005',
        'CIH-20260603-0001',
        'Ayşe Demir',
        '05332222222',
        'ayse.demir@email.com',
        '$2b$10$euXhk1hQ3Ui.tp3jILZW5.IYwNVe8peVURptJQdHK4UaonxVlcn/m',
        'PC', 'HP', 'Pavilion 15',
        'Şarj soketi gevşek.',
        'Şarj soketi değişimi',
        850.00,
        8,
        'b0000000-0000-4000-8000-000000000002',
        7, 7, 3,
        'a0000000-0000-4000-8000-000000000001',
        'Parça değişimi tamamlandı, test OK.',
        850.00,
        '2026-06-03 08:45:00+03',
        NULL,
        '2026-06-03 08:45:00+03'
    );

-- -----------------------------------------------------------------------------
-- DURUM GEÇMİŞİ (v2 history[] — step + recorded_at)
-- -----------------------------------------------------------------------------

-- CIH-20260520-0001 — tam akış
INSERT INTO status_history (repair_request_id, step, recorded_at, changed_by_id, status_id) VALUES
    ('c0000000-0000-4000-8000-000000000001', 'Cihaz Alındı',   '2026-05-20 10:30:00+03', 'a0000000-0000-4000-8000-000000000001', 1),
    ('c0000000-0000-4000-8000-000000000001', 'Beklemede',      '2026-05-20 10:30:00+03', 'a0000000-0000-4000-8000-000000000001', 2),
    ('c0000000-0000-4000-8000-000000000001', 'Onay Bekliyor',  '2026-05-20 15:00:00+03', 'a0000000-0000-4000-8000-000000000001', 4),
    ('c0000000-0000-4000-8000-000000000001', 'Onaylandı',      '2026-05-21 09:20:00+03', 'b0000000-0000-4000-8000-000000000001', 5),
    ('c0000000-0000-4000-8000-000000000001', 'Tamirde',        '2026-05-21 10:00:00+03', 'a0000000-0000-4000-8000-000000000001', 7),
    ('c0000000-0000-4000-8000-000000000001', 'Hazır',          '2026-05-25 11:30:00+03', 'a0000000-0000-4000-8000-000000000001', 8),
    ('c0000000-0000-4000-8000-000000000001', 'Teslim Edildi',  '2026-05-25 16:00:00+03', 'a0000000-0000-4000-8000-000000000001', 9);

-- CIH-20260605-0001 — onay bekliyor
INSERT INTO status_history (repair_request_id, step, recorded_at, changed_by_id, status_id) VALUES
    ('c0000000-0000-4000-8000-000000000002', 'Cihaz Alındı',   '2026-06-05 14:00:00+03', 'a0000000-0000-4000-8000-000000000001', 1),
    ('c0000000-0000-4000-8000-000000000002', 'Beklemede',      '2026-06-05 14:00:00+03', 'a0000000-0000-4000-8000-000000000001', 2),
    ('c0000000-0000-4000-8000-000000000002', 'Onay Bekliyor',  '2026-06-05 17:30:00+03', 'a0000000-0000-4000-8000-000000000001', 4);

-- CIH-20260601-0001 — tamirde
INSERT INTO status_history (repair_request_id, step, recorded_at, changed_by_id, status_id) VALUES
    ('c0000000-0000-4000-8000-000000000003', 'Cihaz Alındı',   '2026-06-01 09:15:00+03', 'a0000000-0000-4000-8000-000000000001', 1),
    ('c0000000-0000-4000-8000-000000000003', 'Beklemede',      '2026-06-01 09:15:00+03', 'a0000000-0000-4000-8000-000000000001', 2),
    ('c0000000-0000-4000-8000-000000000003', 'Onay Bekliyor',  '2026-06-01 12:00:00+03', 'a0000000-0000-4000-8000-000000000001', 4),
    ('c0000000-0000-4000-8000-000000000003', 'Onaylandı',      '2026-06-02 08:10:00+03', 'b0000000-0000-4000-8000-000000000003', 5),
    ('c0000000-0000-4000-8000-000000000003', 'Tamirde',        '2026-06-02 09:00:00+03', 'a0000000-0000-4000-8000-000000000001', 7);

-- CIH-20260528-0001 — reddedildi
INSERT INTO status_history (repair_request_id, step, recorded_at, changed_by_id, status_id) VALUES
    ('c0000000-0000-4000-8000-000000000004', 'Cihaz Alındı',   '2026-05-28 11:00:00+03', 'a0000000-0000-4000-8000-000000000001', 1),
    ('c0000000-0000-4000-8000-000000000004', 'Beklemede',      '2026-05-28 11:00:00+03', 'a0000000-0000-4000-8000-000000000001', 2),
    ('c0000000-0000-4000-8000-000000000004', 'Onay Bekliyor',  '2026-05-28 14:00:00+03', 'a0000000-0000-4000-8000-000000000001', 4),
    ('c0000000-0000-4000-8000-000000000004', 'Reddedildi',     '2026-05-29 10:45:00+03', 'b0000000-0000-4000-8000-000000000001', 6);

-- CIH-20260603-0001 — hazır
INSERT INTO status_history (repair_request_id, step, recorded_at, changed_by_id, status_id) VALUES
    ('c0000000-0000-4000-8000-000000000005', 'Cihaz Alındı',   '2026-06-03 08:45:00+03', 'a0000000-0000-4000-8000-000000000001', 1),
    ('c0000000-0000-4000-8000-000000000005', 'Beklemede',      '2026-06-03 08:45:00+03', 'a0000000-0000-4000-8000-000000000001', 2),
    ('c0000000-0000-4000-8000-000000000005', 'Onay Bekliyor',  '2026-06-03 11:00:00+03', 'a0000000-0000-4000-8000-000000000001', 4),
    ('c0000000-0000-4000-8000-000000000005', 'Onaylandı',      '2026-06-03 14:20:00+03', 'b0000000-0000-4000-8000-000000000002', 5),
    ('c0000000-0000-4000-8000-000000000005', 'Tamirde',        '2026-06-04 09:00:00+03', 'a0000000-0000-4000-8000-000000000001', 7),
    ('c0000000-0000-4000-8000-000000000005', 'Hazır',          '2026-06-06 15:30:00+03', 'a0000000-0000-4000-8000-000000000001', 8);

-- -----------------------------------------------------------------------------
-- ONAY / RED
-- -----------------------------------------------------------------------------

INSERT INTO approvals (repair_request_id, customer_id, decision, price_at_decision, rejection_reason, decided_at) VALUES
    ('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'approved', 4500.00, NULL,                '2026-05-21 09:20:00+03'),
    ('c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003', 'approved', 3500.00, NULL,                '2026-06-02 08:10:00+03'),
    ('c0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', 'rejected', 2800.00, 'Fiyat çok yüksek.', '2026-05-29 10:45:00+03'),
    ('c0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000002', 'approved',  850.00, NULL,                '2026-06-03 14:20:00+03');

-- -----------------------------------------------------------------------------
-- FİYAT GEÇMİŞİ
-- -----------------------------------------------------------------------------

INSERT INTO price_history (repair_request_id, amount, changed_by_id, reason, created_at) VALUES
    ('c0000000-0000-4000-8000-000000000001', 4000.00, 'a0000000-0000-4000-8000-000000000001', 'İlk teklif',               '2026-05-20 14:00:00+03'),
    ('c0000000-0000-4000-8000-000000000001', 4500.00, 'a0000000-0000-4000-8000-000000000001', 'Orijinal parça fiyat farkı', '2026-05-20 15:00:00+03'),
    ('c0000000-0000-4000-8000-000000000002', 1200.00, 'a0000000-0000-4000-8000-000000000001', 'Pil değişim teklifi',      '2026-06-05 17:00:00+03'),
    ('c0000000-0000-4000-8000-000000000003', 3500.00, 'a0000000-0000-4000-8000-000000000001', 'Anakart onarım teklifi',   '2026-06-01 12:00:00+03'),
    ('c0000000-0000-4000-8000-000000000004', 2800.00, 'a0000000-0000-4000-8000-000000000001', 'Ekran değişim teklifi',    '2026-05-28 14:00:00+03'),
    ('c0000000-0000-4000-8000-000000000005',  850.00, 'a0000000-0000-4000-8000-000000000001', 'Şarj soketi değişimi',     '2026-06-03 11:00:00+03');

-- -----------------------------------------------------------------------------
-- BİLDİRİMLER
-- -----------------------------------------------------------------------------

INSERT INTO notifications (user_id, repair_request_id, notification_type_id, title, message, is_read, read_at, created_at) VALUES
    (
        'b0000000-0000-4000-8000-000000000001',
        'c0000000-0000-4000-8000-000000000001',
        2,
        'Onay Talebi',
        'CIH-20260520-0001 için 4.500 ₺ tamir teklifi onayınızı bekliyor.',
        TRUE, '2026-05-21 09:15:00+03', '2026-05-20 15:05:00+03'
    ),
    (
        'b0000000-0000-4000-8000-000000000001',
        'c0000000-0000-4000-8000-000000000001',
        6,
        'Cihazınız Hazır',
        'CIH-20260520-0001 numaralı cihazınız teslim alınabilir.',
        TRUE, '2026-05-25 12:00:00+03', '2026-05-25 11:35:00+03'
    ),
    (
        'b0000000-0000-4000-8000-000000000002',
        'c0000000-0000-4000-8000-000000000002',
        2,
        'Onay Talebi',
        'CIH-20260605-0001 için 1.200 ₺ pil değişim teklifi onayınızı bekliyor.',
        FALSE, NULL, '2026-06-05 17:35:00+03'
    ),
    (
        'b0000000-0000-4000-8000-000000000002',
        'c0000000-0000-4000-8000-000000000005',
        6,
        'Cihazınız Hazır',
        'CIH-20260603-0001 numaralı cihazınız teslim alınabilir.',
        FALSE, NULL, '2026-06-06 15:35:00+03'
    ),
    (
        'b0000000-0000-4000-8000-000000000003',
        'c0000000-0000-4000-8000-000000000003',
        1,
        'Durum Güncellemesi',
        'CIH-20260601-0001 kaydınız "Tamirde" durumuna geçti.',
        TRUE, '2026-06-02 10:00:00+03', '2026-06-02 09:05:00+03'
    ),
    (
        'a0000000-0000-4000-8000-000000000001',
        'c0000000-0000-4000-8000-000000000004',
        3,
        'Teklif Reddedildi',
        'CIH-20260528-0001 müşteri tarafından reddedildi.',
        TRUE, '2026-05-29 11:00:00+03', '2026-05-29 10:50:00+03'
    );

-- -----------------------------------------------------------------------------
-- ÖDEMELER
-- -----------------------------------------------------------------------------

INSERT INTO payments (
    repair_request_id, amount, payment_method, payment_status,
    transaction_ref, paid_at, recorded_by_id, notes, created_at
) VALUES
    (
        'c0000000-0000-4000-8000-000000000001',
        4500.00, 'credit_card', 'completed',
        'POS-20260525-88421',
        '2026-05-25 16:00:00+03',
        'a0000000-0000-4000-8000-000000000001',
        'Teslim sırasında kredi kartı ile tahsil edildi.',
        '2026-05-25 16:00:00+03'
    ),
    (
        'c0000000-0000-4000-8000-000000000005',
        850.00, 'cash', 'pending',
        NULL, NULL,
        'a0000000-0000-4000-8000-000000000001',
        'Teslimde nakit tahsil edilecek.',
        '2026-06-06 15:35:00+03'
    );

-- -----------------------------------------------------------------------------
-- YORUM VE DEĞERLENDİRME
-- -----------------------------------------------------------------------------

INSERT INTO reviews (repair_request_id, customer_id, rating, comment, created_at) VALUES
    (
        'c0000000-0000-4000-8000-000000000001',
        'b0000000-0000-4000-8000-000000000001',
        5,
        'Çok hızlı ve profesyonel hizmet. Ekran sorunsuz çalışıyor, teşekkürler!',
        '2026-05-26 10:00:00+03'
    );
