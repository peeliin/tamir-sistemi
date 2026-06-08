-- =============================================================================
-- Tamir Sistemi — PostgreSQL Veritabanı Şeması (v2 uyumlu)
-- React frontend (tamir-sistemi-mainv2) ile eşleşecek şekilde tasarlanmıştır.
--
-- v2 alan eşlemesi (repair_requests):
--   referansNo  → referans_no      (CIH-YYYYMMDD-0001)
--   adSoyad     → ad_soyad
--   telefon     → telefon
--   email       → email
--   sifre       → customer_password_hash
--   cihazTuru   → cihaz_turu       (Telefon | PC | Tablet)
--   marka       → marka
--   model       → model
--   arizaNot    → ariza_not
--   islem       → islem
--   fiyat       → fiyat
--   durum       → repair_statuses.name (current_status_id üzerinden)
--   history     → status_history (step + recorded_at)
--
-- Admin girişi (v2): users.username + users.password_hash  (örn. admin / admin123)
-- Müşteri girişi (v2): referans_no + customer_password_hash
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. ROLLER VE KULLANICILAR
-- -----------------------------------------------------------------------------

CREATE TABLE roles (
    id          SMALLSERIAL PRIMARY KEY,
    code        VARCHAR(30)  NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id         SMALLINT     NOT NULL REFERENCES roles (id),
    username        VARCHAR(50)  UNIQUE,
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(20)  UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(150) NOT NULL,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT users_contact_check CHECK (
        username IS NOT NULL OR email IS NOT NULL OR phone IS NOT NULL
    )
);

CREATE TABLE customer_profiles (
    user_id     UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    address     TEXT,
    city        VARCHAR(100),
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. CİHAZ VE İŞLEM SÖZLÜK TABLOLARI (lookup — isteğe bağlı normalizasyon)
-- -----------------------------------------------------------------------------

CREATE TABLE brands (
    id          SMALLSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE device_models (
    id          SERIAL PRIMARY KEY,
    brand_id    SMALLINT     NOT NULL REFERENCES brands (id),
    name        VARCHAR(150) NOT NULL,
    device_type VARCHAR(20)  NOT NULL DEFAULT 'Telefon'
        CHECK (device_type IN ('Telefon', 'PC', 'Tablet')),
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (brand_id, name)
);

CREATE TABLE repair_types (
    id          SMALLSERIAL PRIMARY KEY,
    code        VARCHAR(50)  NOT NULL UNIQUE,
    name        VARCHAR(150) NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. DURUM (WORKFLOW) SÖZLÜĞÜ — v2 durum metinleriyle birebir
-- -----------------------------------------------------------------------------

CREATE TABLE repair_statuses (
    id           SMALLSERIAL PRIMARY KEY,
    code         VARCHAR(50)  NOT NULL UNIQUE,
    name         VARCHAR(100) NOT NULL UNIQUE,
    sort_order   SMALLINT     NOT NULL,
    is_terminal  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. TAMİR KAYDI (ANA VARLIK — v2 devices[] nesnesinin DB karşılığı)
-- -----------------------------------------------------------------------------

CREATE TABLE repair_requests (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referans_no             VARCHAR(20)  NOT NULL UNIQUE,
    ad_soyad                VARCHAR(150) NOT NULL,
    telefon                 VARCHAR(20)  NOT NULL,
    email                   VARCHAR(255),
    customer_password_hash  VARCHAR(255) NOT NULL,
    cihaz_turu              VARCHAR(20)  NOT NULL
        CHECK (cihaz_turu IN ('Telefon', 'PC', 'Tablet')),
    marka                   VARCHAR(100) NOT NULL,
    model                   VARCHAR(150) NOT NULL,
    ariza_not               TEXT         NOT NULL,
    islem                   TEXT         NOT NULL DEFAULT '',
    fiyat                   NUMERIC(12, 2) NOT NULL DEFAULT 0
        CHECK (fiyat >= 0),
    current_status_id       SMALLINT     NOT NULL REFERENCES repair_statuses (id),
    customer_id             UUID         REFERENCES users (id),
    brand_id                SMALLINT     REFERENCES brands (id),
    device_model_id         INTEGER      REFERENCES device_models (id),
    repair_type_id          SMALLINT     REFERENCES repair_types (id),
    assigned_admin_id       UUID         REFERENCES users (id),
    admin_notes             TEXT,
    final_price             NUMERIC(12, 2)
        CHECK (final_price IS NULL OR final_price >= 0),
    received_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    delivered_at            TIMESTAMPTZ,
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT referans_no_format CHECK (
        referans_no ~ '^CIH-[0-9]{8}-[0-9]{4}$'
    )
);

-- -----------------------------------------------------------------------------
-- 5. DURUM GEÇMİŞİ (TIMELINE — v2 history[] dizisi)
-- -----------------------------------------------------------------------------

CREATE TABLE status_history (
    id                  BIGSERIAL PRIMARY KEY,
    repair_request_id   UUID         NOT NULL REFERENCES repair_requests (id) ON DELETE CASCADE,
    step                VARCHAR(100) NOT NULL,
    recorded_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    status_id           SMALLINT     REFERENCES repair_statuses (id),
    changed_by_id       UUID         REFERENCES users (id),
    note                TEXT
);

-- -----------------------------------------------------------------------------
-- 6. ONAY / RED
-- -----------------------------------------------------------------------------

CREATE TABLE approvals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repair_request_id   UUID           NOT NULL REFERENCES repair_requests (id) ON DELETE CASCADE,
    customer_id         UUID           REFERENCES users (id),
    decision            VARCHAR(20)    NOT NULL
        CHECK (decision IN ('approved', 'rejected')),
    price_at_decision   NUMERIC(12, 2) NOT NULL CHECK (price_at_decision >= 0),
    rejection_reason    TEXT,
    decided_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. FİYAT GEÇMİŞİ
-- -----------------------------------------------------------------------------

CREATE TABLE price_history (
    id                  BIGSERIAL PRIMARY KEY,
    repair_request_id   UUID           NOT NULL REFERENCES repair_requests (id) ON DELETE CASCADE,
    amount              NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    changed_by_id       UUID           NOT NULL REFERENCES users (id),
    reason              TEXT,
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. BİLDİRİMLER
-- -----------------------------------------------------------------------------

CREATE TABLE notification_types (
    id          SMALLSERIAL PRIMARY KEY,
    code        VARCHAR(50)  NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    repair_request_id    UUID        REFERENCES repair_requests (id) ON DELETE SET NULL,
    notification_type_id SMALLINT    NOT NULL REFERENCES notification_types (id),
    title                VARCHAR(200) NOT NULL,
    message              TEXT         NOT NULL,
    is_read              BOOLEAN      NOT NULL DEFAULT FALSE,
    read_at              TIMESTAMPTZ,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 9. ÖDEMELER
-- -----------------------------------------------------------------------------

CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repair_request_id   UUID           NOT NULL REFERENCES repair_requests (id) ON DELETE CASCADE,
    amount              NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method      VARCHAR(30)    NOT NULL
        CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'other')),
    payment_status      VARCHAR(20)    NOT NULL DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_ref     VARCHAR(100),
    paid_at             TIMESTAMPTZ,
    recorded_by_id      UUID           NOT NULL REFERENCES users (id),
    notes               TEXT,
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 10. YORUM VE DEĞERLENDİRME
-- -----------------------------------------------------------------------------

CREATE TABLE reviews (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repair_request_id   UUID        NOT NULL UNIQUE REFERENCES repair_requests (id) ON DELETE CASCADE,
    customer_id         UUID        REFERENCES users (id),
    rating              SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment             TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- İNDEKSLER
-- -----------------------------------------------------------------------------

CREATE INDEX idx_users_role_id               ON users (role_id);
CREATE INDEX idx_users_username              ON users (username) WHERE username IS NOT NULL;
CREATE INDEX idx_users_email                 ON users (email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_phone                 ON users (phone) WHERE phone IS NOT NULL;

CREATE INDEX idx_device_models_brand_id      ON device_models (brand_id);

CREATE INDEX idx_repair_requests_status      ON repair_requests (current_status_id);
CREATE INDEX idx_repair_requests_referans    ON repair_requests (referans_no);
CREATE INDEX idx_repair_requests_telefon     ON repair_requests (telefon);
CREATE INDEX idx_repair_requests_created     ON repair_requests (created_at DESC);

CREATE INDEX idx_status_history_request      ON status_history (repair_request_id, recorded_at);
CREATE INDEX idx_approvals_request           ON approvals (repair_request_id);

CREATE INDEX idx_notifications_user_unread   ON notifications (user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_request       ON notifications (repair_request_id);

CREATE INDEX idx_payments_request            ON payments (repair_request_id);
CREATE INDEX idx_payments_status             ON payments (payment_status);

CREATE INDEX idx_reviews_rating              ON reviews (rating);

-- -----------------------------------------------------------------------------
-- updated_at OTOMATİK GÜNCELLEME
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_customer_profiles_updated_at
    BEFORE UPDATE ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_repair_requests_updated_at
    BEFORE UPDATE ON repair_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- BAŞLANGIÇ VERİLERİ (SEED)
-- -----------------------------------------------------------------------------

INSERT INTO roles (code, name) VALUES
    ('admin',    'Admin'),
    ('customer', 'Müşteri');

-- v2 statusHelpers.js ve CustomerStatus.jsx ile uyumlu durum adları
INSERT INTO repair_statuses (code, name, sort_order, is_terminal) VALUES
    ('cihaz_alindi',   'Cihaz Alındı',    0, FALSE),
    ('beklemede',      'Beklemede',       1, FALSE),
    ('inceleniyor',    'İnceleniyor',     2, FALSE),
    ('onay_bekliyor',  'Onay Bekliyor',   3, FALSE),
    ('onaylandi',      'Onaylandı',       4, FALSE),
    ('reddedildi',     'Reddedildi',      5, TRUE),
    ('tamirde',        'Tamirde',         6, FALSE),
    ('hazir',          'Hazır',           7, FALSE),
    ('teslim_edildi',  'Teslim Edildi',   8, TRUE);

INSERT INTO repair_types (code, name) VALUES
    ('ekran_kirik',     'Ekran Kırık'),
    ('pil_sorunu',      'Pil Sorunu'),
    ('sarj_soketi',     'Şarj Soketi'),
    ('kamera_arizasi',  'Kamera Arızası'),
    ('hoparlor_sorunu', 'Hoparlör Sorunu'),
    ('yazilim_sorunu',  'Yazılım Sorunu'),
    ('anakart_arizasi', 'Anakart Arızası'),
    ('su_hasari',       'Su Hasarı'),
    ('diger',           'Diğer');

-- v2 NewDevice.jsx marka listesiyle uyumlu
INSERT INTO brands (name) VALUES
    ('Apple'),
    ('Samsung'),
    ('Xiaomi'),
    ('Huawei'),
    ('Oppo'),
    ('Lenovo'),
    ('HP'),
    ('Asus'),
    ('Dell'),
    ('Diğer');

INSERT INTO notification_types (code, name) VALUES
    ('status_update',    'Durum Güncellemesi'),
    ('approval_request', 'Onay Talebi'),
    ('approval_result',  'Onay / Red Sonucu'),
    ('price_update',     'Fiyat Güncellemesi'),
    ('payment_received', 'Ödeme Alındı'),
    ('ready_pickup',     'Teslim Hazır'),
    ('review_request',   'Değerlendirme Talebi');
