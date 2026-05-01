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

      let domain = url.hostname;

      let score = 100;
      let reasons = [];

      // =============================
      // 🔐 SECURITY CHECKS
      // =============================

      if (!link.startsWith("https")) {
        score -= 10;
        reasons.push("لا يستخدم HTTPS");
      }

      if (/(bit\.ly|tinyurl|t\.co|is\.gd)/.test(domain)) {
        score -= 30;
        reasons.push("رابط مختصر يخفي الوجهة");
      }

      let fakeWords = ["g00gle", "faceb00k", "paypa1", "micros0ft"];
      fakeWords.forEach(w => {
        if (link.toLowerCase().includes(w)) {
          score -= 40;
          reasons.push("دومين مزيف (تقليد موقع مشهور)");
        }
      });

      if (/\.(xyz|ru|top|click|tk)$/.test(domain)) {
        score -= 30;
        reasons.push("امتداد غير موثوق");
      }

      if (/login|verify|secure|update|bank/i.test(link)) {
        score -= 20;
        reasons.push("يحتوي على كلمات تصيّد");
      }

      if (link.includes("@")) {
        score -= 25;
        reasons.push("إخفاء الوجهة باستخدام @");
      }

      if (link.length > 80) {
        score -= 10;
        reasons.push("الرابط طويل بشكل غير طبيعي");
      }

      if (domain.split(".").length > 3) {
        score -= 15;
        reasons.push("عدد نطاقات فرعية كبير");
      }

      // =============================
      // 🧠 ADVANCED DETECTION
      // =============================

      // IP
      if (/(\d{1,3}\.){3}\d{1,3}/.test(domain)) {
        score -= 30;
        reasons.push("يستخدم IP بدل اسم موقع");
      }

      // % encoding
      if (/%[0-9A-Fa-f]{2}/.test(link)) {
        score -= 15;
        reasons.push("يحتوي على تشفير مخفي (%)");
      }

      // شرطات
      let dashCount = (domain.match(/-/g) || []).length;
      if (dashCount > 3) {
        score -= 10;
        reasons.push("عدد كبير من الشرطات في الدومين");
      }

      // كلمات مالية
      if (/bank|payment|card|account/i.test(link)) {
        score -= 15;
        reasons.push("يحتوي كلمات مالية حساسة");
      }

      // بورت
      if (url.port && url.port !== "80" && url.port !== "443") {
        score -= 15;
        reasons.push("يستخدم بورت غير معتاد");
      }

      // https خداع
      if (/https/i.test(link) && !link.startsWith("https")) {
        score -= 15;
        reasons.push("محاولة خداع باستخدام كلمة https داخل الرابط");
      }

      // دومين عشوائي
      if (/[a-z]{5,}\d{3,}/i.test(domain)) {
        score -= 15;
        reasons.push("اسم الدومين يبدو عشوائي");
      }

      // ENTROPY
      let entropy = calculateEntropy(link);
      if (entropy > 4.3) {
        score -= 15;
        reasons.push("الرابط يحتوي عشوائية عالية");
      }

      // =============================
      // 🎯 FINAL SCORE
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

      // =============================
      // 🧠 شرح ذكي
      // =============================
      let explanationText = generateExplanation(reasons, score);

      // =============================
      // 📊 REPORT
      // =============================
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

      showResult(
        `${status} (${score}/100)`,
        explanationText,
        className
      );

      window.lastReport = report;
      saveHistory(link, score, threat);

    } catch (e) {
      loading.style.display = "none";
      showResult("❌ خطأ", "حدث خطأ غير متوقع", "danger");
    }

  }, 500);
}

// ===============================
// 🧠 ENTROPY
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
// 🧠 شرح ذكي
// ===============================
function generateExplanation(reasons, score) {

  if (reasons.length === 0) {
    return "لم يتم اكتشاف مؤشرات خطورة واضحة، لكن يفضل الحذر دائمًا.";
  }

  let intro = "";

  if (score >= 80) {
    intro = "الرابط يبدو آمن بشكل عام، لكن توجد ملاحظات:";
  } else if (score >= 50) {
    intro = "الرابط يحتوي على مؤشرات قد تدل على أنه مشبوه:";
  } else {
    intro = "⚠️ الرابط يحتوي على مؤشرات خطيرة:";
  }

  let list = reasons.map(r => "• " + r).join("\n");

  return `${intro}\n\n${list}`;
}

// ===============================
function showResult(text, explanation, className) {
  document.getElementById("result").className = "result " + className;
  document.getElementById("result").innerText = text;
  document.getElementById("explanation").innerText = explanation;
  document.getElementById("result").style.opacity = 1;
}

// ===============================
function clearInput() {
  document.getElementById("link").value = "";
  document.getElementById("result").innerText = "";
  document.getElementById("explanation").innerText = "";
  document.getElementById("loading").style.display = "none";
}

// ===============================
function copyReport() {
  if (!window.lastReport) return;
  navigator.clipboard.writeText(window.lastReport);
  alert("📋 تم نسخ التقرير");
}

// ===============================
function saveHistory(link, score, threat) {
  let history = JSON.parse(localStorage.getItem("cg_history") || "[]");

  history.unshift({
    link,
    score,
    threat,
    time: new Date().toLocaleString()
  });

  history = history.slice(0, 5);
  localStorage.setItem("cg_history", JSON.stringify(history));
}

// ===============================
function triggerAlert() {
  document.body.style.background = "#2a0f0f";
  setTimeout(() => {
    document.body.style.background = "#0f172a";
  }, 700);
}