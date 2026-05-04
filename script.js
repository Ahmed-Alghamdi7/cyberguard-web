// ============================================================
// 🧠 LEVENSHTEIN DISTANCE ALGORITHM
// خوارزمية ذكية تحسب عدد العمليات المطلوبة لتحويل نص إلى آخر
// تستخدم هنا لكشف محاولات تزييف أسماء المواقع (Typosquatting)
// ============================================================
function getLevenshteinDistance(s1, s2) {
    const len1 = s1.length, len2 = s2.length;
    const matrix = Array.from({ length: len1 + 1 }, () => new Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // حذف
                matrix[i][j - 1] + 1,      // إضافة
                matrix[i - 1][j - 1] + cost // تبديل
            );
        }
    }
    return matrix[len1][len2];
}

// ============================================================
// 🔍 MAIN ANALYZE FUNCTION
// ============================================================
function analyze() {
  let link = document.getElementById("link").value.trim();
  let resultBox = document.getElementById("result");
  let explanationBox = document.getElementById("explanation");
  let loading = document.getElementById("loading");

  loading.style.display = "block";
  resultBox.style.opacity = 0;

  setTimeout(() => {
    try {
      loading.style.display = "none";

      // ❌ فحص أساسي
      if (!link) {
        showResult("❌ الرجاء إدخال رابط", "", "danger");
        return;
      }

      if (!link.includes(".")) {
        showResult("❌ هذا ليس رابطًا صحيحًا", "", "danger");
        return;
      }

      // 🌐 تحويل الرابط
      let url;
      try {
        url = new URL(link.startsWith("http") ? link : "http://" + link);
      } catch {
        showResult("❌ رابط غير صالح", "", "danger");
        return;
      }

      let domain = url.hostname.toLowerCase();
      let score = 100;
      let reasons = [];

      // ============================================================
      // 🛡️ SMART WHITELIST CHECK (القائمة البيضاء الذكية)
      // تم إضافة رموز التحكم بالاتجاه \u202b و \u202c لحل مشكلة النص المعكوس
      // ============================================================
      const whitelist = {
          "google.com": "شركة Google العالمية",
          "microsoft.com": "شركة Microsoft",
          "saudi.gov.sa": "بوابة النفاذ الوطني / جهات حكومية سعودية",
          "apple.com": "شركة Apple",
          "github.com": "منصة GitHub للمبرمجين",
          "moe.gov.sa": "وزارة التعليم السعودية",
          "mof.gov.sa": "وزارة المالية السعودية",
          "twitter.com": "منصة X (تويتر سابقاً)",
          "instagram.com": "منصة Instagram"
      };

      let trustedEntity = "";
      for (let key in whitelist) {
          if (domain === key || domain.endsWith("." + key)) {
              trustedEntity = whitelist[key];
              break;
          }
      }

      if (trustedEntity) {
          const professionalAdvice = `\u202bهذا النطاق يتبع لجهة موثوقة: [${trustedEntity}].\u202c

💡 نصيحة أمنية:
حتى مع المواقع الرسمية، كن حذراً من الروابط المرسلة من مجهولين. تذكر أن الجهات الموثوقة لا تطلب منك كلمات المرور أو رموز التحقق عبر روابط خارجية.`;
          
          showResult("✅ آمن (رابط موثوق)", professionalAdvice, "safe");
          return; // إنهاء الفحص هنا لأن الموقع موثوق رسمياً
      }

      // =============================
      // 🔐 SECURITY CHECKS
      // =============================

      if (!link.startsWith("https")) {
        score -= 10;
        reasons.push("لا يستخدم HTTPS");
      }

      // ⚠️ كشف هجمات المتجانسات (Punycode)
      if (domain.includes("xn--")) {
        score -= 50;
        reasons.push("تنبيه: الرابط يستخدم رموزاً مخفية (Punycode) لمحاكاة حروف عالمية");
      }

      // ⚠️ كشف التزييف الذكي (Levenshtein Detection)
      const trustedBrands = ["google", "facebook", "paypal", "microsoft", "amazon", "apple", "netflix", "binance"];
      const domainParts = domain.split('.');
      const mainName = domainParts[domainParts.length - 2]; 

      trustedBrands.forEach(brand => {
          let distance = getLevenshteinDistance(mainName, brand);
          if (distance > 0 && distance <= 2) { // إذا كان الاختلاف حرف أو حرفين
              score -= 45;
              reasons.push(`محاولة تقليد اسم موقع مشهور (${brand})`);
          }
      });

      if (/(bit\.ly|tinyurl|t\.co|is\.gd)/.test(domain)) {
        score -= 30;
        reasons.push("رابط مختصر يخفي الوجهة");
      }

      if (/\.(xyz|ru|top|click|tk)$/.test(domain)) {
        score -= 30;
        reasons.push("امتداد (TLD) غير موثوق");
      }

      if (/login|verify|secure|update|bank/i.test(link)) {
        score -= 20;
        reasons.push("يحتوي على كلمات تصيّد");
      }

      if (link.includes("@")) {
        score -= 25;
        reasons.push("محاولة إخفاء الوجهة باستخدام رمز @");
      }

      if (link.length > 80) {
        score -= 10;
        reasons.push("الرابط طويل بشكل غير طبيعي");
      }

      if (domain.split(".").length > 3) {
        score -= 15;
        reasons.push("عدد نطاقات فرعية كبير (Subdomain Depth)");
      }

      // =============================
      // 🧠 ADVANCED DETECTION
      // =============================

      if (/(\d{1,3}\.){3}\d{1,3}/.test(domain)) {
        score -= 30;
        reasons.push("يستخدم IP بدل اسم موقع");
      }

      if (/%[0-9A-Fa-f]{2}/.test(link)) {
        score -= 15;
        reasons.push("يحتوي على تشفير مخفي (%)");
      }

      let dashCount = (domain.match(/-/g) || []).length;
      if (dashCount > 3) {
        score -= 10;
        reasons.push("عدد كبير من الشرطات في الدومين");
      }

      if (url.port && url.port !== "80" && url.port !== "443") {
        score -= 15;
        reasons.push("يستخدم منفذ (Port) غير معتاد");
      }

      if (/[a-z]{5,}\d{3,}/i.test(domain)) {
        score -= 15;
        reasons.push("اسم الدومين يبدو عشوائياً (DGA)");
      }

      let entropy = calculateEntropy(link);
      if (entropy > 4.3) {
        score -= 15;
        reasons.push("الرابط يحتوي عشوائية حروف عالية جداً");
      }

      // =============================
      // 🎯 FINAL SCORE CALCULATION
      // =============================
      score = Math.max(0, Math.min(100, score));

      let status = "";
      let className = "";
      let threat = "";

      if (score >= 80) {
        status = "✅ آمن";
        className = "safe";
        threat = "Low";
      } else if (score >= 50) {
        status = "⚠️ مشبوه";
        className = "warn";
        threat = "Medium";
      } else {
        status = "❌ خطير";
        className = "danger";
        threat = "High";
        triggerAlert();
      }

      let explanationText = generateExplanation(reasons, score);

      // 📊 REPORT DATA
      let report = `
Cyber Guard Report
-------------------
URL: ${link}
Domain: ${domain}
Score: ${score}/100
Threat: ${threat}

${explanationText}

Entropy: ${entropy.toFixed(2)}
-------------------
`;

      showResult(`${status} (${score}/100)`, explanationText, className);
      window.lastReport = report;
      saveHistory(link, score, threat);

    } catch (e) {
      loading.style.display = "none";
      showResult("❌ خطأ", "حدث خطأ غير متوقع أثناء التحليل", "danger");
    }
  }, 500);
}

// ===============================
// 🧠 ENTROPY CALCULATION
// ===============================
function calculateEntropy(str) {
  let freq = {};
  for (let c of str) freq[c] = (freq[c] || 0) + 1;
  let entropy = 0;
  let len = str.length;
  for (let c in freq) {
    let p = freq[c] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

// ===============================
// 🧠 SMART EXPLANATION GENERATOR
// ===============================
function generateExplanation(reasons, score) {
  if (reasons.length === 0) {
    return "لم يتم اكتشاف مؤشرات خطورة واضحة، لكن يفضل الحذر دائمًا.";
  }
  let intro = score >= 80 ? "الرابط يبدو آمن بشكل عام، لكن توجد ملاحظات:" : 
              (score >= 50 ? "الرابط يحتوي على مؤشرات قد تدل على أنه مشبوه:" : "⚠️ الرابط يحتوي على مؤشرات خطيرة:");
  
  let list = reasons.map(r => "• " + r).join("\n");
  return `${intro}\n\n${list}`;
}

// ===============================
// UI HELPER FUNCTIONS
// ===============================
function showResult(text, explanation, className) {
  let res = document.getElementById("result");
  res.className = "result " + className;
  res.innerText = text;
  document.getElementById("explanation").innerText = explanation;
  res.style.opacity = 1;
}

function clearInput() {
  document.getElementById("link").value = "";
  document.getElementById("result").innerText = "";
  document.getElementById("explanation").innerText = "";
  document.getElementById("loading").style.display = "none";
}

function copyReport() {
  if (!window.lastReport) return;
  navigator.clipboard.writeText(window.lastReport);
  alert("📋 تم نسخ التقرير");
}

function saveHistory(link, score, threat) {
  let history = JSON.parse(localStorage.getItem("cg_history") || "[]");
  history.unshift({ link, score, threat, time: new Date().toLocaleString() });
  history = history.slice(0, 5);
  localStorage.setItem("cg_history", JSON.stringify(history));
}

function triggerAlert() {
  document.body.style.background = "#2a0f0f";
  setTimeout(() => {
    document.body.style.background = "#0f172a";
  }, 700);
}