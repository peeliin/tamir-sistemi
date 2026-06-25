import emailjs from '@emailjs/browser';

// 👇 İŞTE ID VE KEY'LERİNİ YAZACAĞIN YERLER BURASI 👇
const EMAILJS_SERVICE_ID = "service_v5kkvtk";
const EMAILJS_TEMPLATE_ID = "template_p9h4flm";
const EMAILJS_PUBLIC_KEY = "xd3WKHUCIAagAmWt4";
// 👆 👆 👆

/**
 * Yeni cihaz kaydı oluşturulduğunda müşteriye atılacak karşılama maili.
 * @param {Object} deviceData Cihaz ve müşteri bilgileri
 */
export const sendWelcomeEmail = async (deviceData) => {

  // Müşteri paneli linkini mevcut domain üzerinden oluşturuyoruz
  const currentOrigin = window.location.origin;
  const trackingLink = `${currentOrigin}/customer`;

  // Şablondaki dinamik alanlar
  const templateParams = {
    to_email: deviceData.email,
    customer_name: deviceData.adSoyad,
    device_info: `${deviceData.marka} ${deviceData.model}`,
    referans_no: deviceData.referansNo,
    tracking_link: trackingLink,

    message_html: `
      <div style="font-family: sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #6b21a8; margin-top: 0;">🛠️ Cihazınız Teslim Alındı</h2>
        <p>Sayın <strong>${deviceData.adSoyad}</strong>,</p>
        <p>Kurumumuza onarım için teslim ettiğiniz <strong>${deviceData.marka} ${deviceData.model}</strong> cihazınız sistemimize başarıyla kaydedilmiştir.</p>
        <p>Cihazınızın güncel durumunu anlık olarak görmek, süreci (inceleniyor, tamirde vb.) takip etmek ve size sunacağımız fiyat teklifini değerlendirmek için aşağıdaki linkten müşteri panelinize ulaşabilirsiniz:</p>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #6b21a8;">
          <p style="margin: 0 0 10px 0;">🔗 <strong>Sipariş / Cihaz Takip Linkiniz:</strong> <a href="${trackingLink}" style="color: #2563eb; text-decoration: none;">${trackingLink}</a></p>
          <p style="margin: 0;">📌 <strong>Referans Numaranız:</strong> <span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${deviceData.referansNo}</span></p>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">Bizi tercih ettiğiniz için teşekkür ederiz. İyi günler dileriz!</p>
      </div>
    `,
  };

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: EMAILJS_PUBLIC_KEY,
      }
    );
    console.log("EmailJS Gönderim Başarılı:", response.status, response.text);
    return true;
  } catch (err) {
    console.error("EmailJS Gönderim Hatası (Detay):", err?.text || err?.message || err);
    return false;
  }
};