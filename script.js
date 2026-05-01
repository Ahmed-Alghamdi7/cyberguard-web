@@ -4,35 +4,32 @@ function analyze() {
  let explanationBox = document.getElementById("explanation");
  let loading = document.getElementById("loading");

  loading.style.display = "none";
  resultBox.style.opacity = 0;

  loading.style.display = "block";
  resultBox.style.opacity = 0;

  setTimeout(() => {

    try {

      loading.style.display = "none";

      // ❌ فارغ
      // ❌ فحص أساسي
      if (!link) {
        showResult("❌ الرجاء إدخال رابط", "الحقل فارغ", "danger");
        showResult("❌ الرجاء إدخال رابط", "", "danger");
        return;
      }

      // ❌ رابط ناقص أو غير منطقي
      if (!link.includes(".")) {
        showResult("❌ هذا ليس رابطًا صحيحًا", "لا يحتوي على نطاق (domain)", "danger");
        showResult("❌ هذا ليس رابطًا صحيحًا", "", "danger");
        return;
      }

      // 🌐 تحويل الرابط الحقيقي
      // 🌐 تحويل الرابط
      let url;
      try {
        url = new URL(link.startsWith("http") ? link : "http://" + link);
      } catch {
        showResult("❌ رابط غير صالح", "لا يمكن قراءته كرابط حقيقي", "danger");
        showResult("❌ رابط غير صالح", "", "danger");
        return;
      }

@@ -41,122 +38,190 @@ function analyze() {
      let score = 100;
      let reasons = [];

      // 🔴 1) HTTP بدون أمان
      // 🔐 HTTPS
      if (!link.startsWith("https")) {
        score -= 10;
        reasons.push("لا يستخدم HTTPS");
      }

      // 🔴 2) روابط مختصرة
      if (
        domain.includes("bit.ly") ||
        domain.includes("tinyurl") ||
        domain.includes("t.co")
      ) {
      // 🔗 Short links
      if (/(bit\.ly|tinyurl|t\.co|is\.gd)/.test(domain)) {
        score -= 30;
        reasons.push("رابط مختصر يخفي الوجهة");
        reasons.push("رابط مختصر");
      }

      // 🔴 3) Typosquatting
      // 🧠 Typosquatting
      let fakeWords = ["g00gle", "faceb00k", "paypa1", "micros0ft"];
      fakeWords.forEach(word => {
        if (link.includes(word)) {
      fakeWords.forEach(w => {
        if (link.toLowerCase().includes(w)) {
          score -= 40;
          reasons.push("دومين مزيف (Typosquatting)");
          reasons.push("دومين مزيف");
        }
      });

      // 🔴 4) دومينات مشبوهة
      if (
        domain.endsWith(".xyz") ||
        domain.endsWith(".ru") ||
        domain.endsWith(".top")
      ) {
      // 🌍 Suspicious TLD
      if (/\.(xyz|ru|top|click|tk)$/.test(domain)) {
        score -= 30;
        reasons.push("امتداد غير موثوق");
        reasons.push("امتداد مشبوه");
      }

      // 🔴 5) كلمات تصيّد
      if (
        link.includes("login") ||
        link.includes("verify") ||
        link.includes("secure")
      ) {
      // 🔐 Phishing words
      if (/login|verify|secure|update|bank/i.test(link)) {
        score -= 20;
        reasons.push("كلمات تصيّد");
      }

      // 🔴 6) @ (خطر redirect)
      // ⚠️ @ trick
      if (link.includes("@")) {
        score -= 25;
        reasons.push("استخدام @ لإخفاء الوجهة");
        reasons.push("إخفاء الوجهة");
      }

      // 🔴 7) طول الرابط
      // 📏 length
      if (link.length > 80) {
        score -= 10;
        reasons.push("رابط طويل بشكل غير طبيعي");
        reasons.push("رابط طويل");
      }

      // 🔴 8) subdomains كثيرة
      // 🌐 subdomains
      if (domain.split(".").length > 3) {
        score -= 15;
        reasons.push("نطاق فرعي مفرط (مشتبه)");
        reasons.push("نطاق فرعي مفرط");
      }

      // 🟢 HTTPS bonus
      if (link.startsWith("https")) {
        score += 5;
      // 🧠 ENTROPY (ذكاء إضافي)
      let entropy = calculateEntropy(link);
      if (entropy > 4.3) {
        score -= 15;
        reasons.push("رابط عشوائي عالي");
      }

      // 🔥 ضبط الحدود
      // 🔥 final score
      score = Math.max(0, Math.min(100, score));

      // 🎯 التصنيف
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

      // 📊 REPORT
      let report = `
Cyber Guard Report
-------------------
URL: ${link}
Domain: ${domain}
Score: ${score}/100
Threat: ${threat}

Reasons:
${reasons.length ? reasons.join("\n") : "No issues detected"}

Entropy: ${entropy.toFixed(2)}
-------------------
`;

      showResult(
        `${status} (${score}/100)`,
        reasons.length ? reasons.join(" - ") : "لا توجد مؤشرات خطورة واضحة",
        reasons.length ? reasons.join(" - ") : "لا توجد مؤشرات خطورة",
        className
      );

    } catch (error) {
      window.lastReport = report;

      saveHistory(link, score, threat);

    } catch (e) {
      loading.style.display = "none";
      showResult("❌ خطأ في التحليل", "حدث خطأ غير متوقع", "danger");
      showResult("❌ خطأ", "حدث خطأ غير متوقع", "danger");
    }

  }, 600);
  }, 500);
}

// 🎯 عرض النتيجة
function showResult(text, explanation, className) {
  let resultBox = document.getElementById("result");
  let explanationBox = document.getElementById("explanation");
// ===============================
// 🧠 ENTROPY
// ===============================
function calculateEntropy(str) {
  let freq = {};
  for (let c of str) freq[c] = (freq[c] || 0) + 1;

  resultBox.className = "result " + className;
  resultBox.innerText = text;
  explanationBox.innerText = explanation;
  let entropy = 0;
  let len = str.length;

  resultBox.style.opacity = 1;
  for (let c in freq) {
    let p = freq[c] / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

// ===============================
// 🎯 SHOW RESULT
// ===============================
function showResult(text, explanation, className) {
  document.getElementById("result").className = "result " + className;
  document.getElementById("result").innerText = text;
  document.getElementById("explanation").innerText = explanation;
  document.getElementById("result").style.opacity = 1;
}

// 🧹 مسح
// ===============================
// 🧹 CLEAR
// ===============================
function clearInput() {
  document.getElementById("link").value = "";
  document.getElementById("result").innerText = "";
  document.getElementById("explanation").innerText = "";
  document.getElementById("loading").style.display = "none";
}

// ===============================
// 📋 COPY REPORT
// ===============================
function copyReport() {
  if (!window.lastReport) return;
  navigator.clipboard.writeText(window.lastReport);
  alert("📋 تم نسخ التقرير");
}

// ===============================
// 🕓 HISTORY
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
// ⚠️ ALERT
// ===============================
function triggerAlert() {
  document.body.style.background = "#2a0f0f";
  setTimeout(() => {
    document.body.style.background = "#0f172a";
  }, 700);
}