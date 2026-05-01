function analyze() {
  let link = document.getElementById("link").value.trim();
  let resultBox = document.getElementById("result");
  let explanationBox = document.getElementById("explanation");
  let loading = document.getElementById("loading");

  // ✅ إصلاح: تأكد إذا العنصر موجود
  if (loading) loading.style.display = "block";
  resultBox.style.opacity = 0;

  setTimeout(() => {

    try {

      if (loading) loading.style.display = "none";

      if (!link) {
        showResult("❌ الرجاء إدخال رابط", "", "danger");
        return;
      }

      // ✅ إصلاح مهم: يمنع الكلام العشوائي
      if (!link.includes(".") || /\s/.test(link)) {
        showResult("❌ هذا ليس رابطًا صحيحًا", "", "danger");
        return;
      }

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

      // 🔐 Security checks
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
          reasons.push("دومين مزيف");
        }
      });

      if (/\.(xyz|ru|top|click|tk)$/.test(domain)) {
        score -= 30;
        reasons.push("امتداد غير موثوق");
      }

      if (/login|verify|secure|update|bank/i.test(link)) {
        score -= 20;
        reasons.push("كلمات تصيّد");
      }

      if (link.includes("@")) {
        score -= 25;
        reasons.push("إخفاء الوجهة");
      }

      if (link.length > 80) {
        score -= 10;
        reasons.push("رابط طويل");
      }

      if (domain.split(".").length > 3) {
        score -= 15;
        reasons.push("نطاق فرعي مفرط");
      }

      // 🧠 Advanced
      let entropy = calculateEntropy(link);
      if (entropy > 4.3) {
        score -= 15;
        reasons.push("عشوائية عالية");
      }

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
      if (loading) loading.style.display = "none";
      showResult("❌ خطأ", "حدث خطأ غير متوقع", "danger");
    }

  }, 500);
}

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
function generateExplanation(reasons, score) {
  if (reasons.length === 0) {
    return "✔ لا توجد مؤشرات خطورة واضحة";
  }

  let intro = score >= 80
    ? "الرابط آمن لكن توجد ملاحظات:"
    : score >= 50
    ? "الرابط مشبوه:"
    : "⚠️ الرابط خطير:";

  return intro + "\n\n" + reasons.map(r => "• " + r).join("\n");
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

  localStorage.setItem("cg_history", JSON.stringify(history.slice(0, 5)));
}

// ===============================
function triggerAlert() {
  document.body.style.background = "#2a0f0f";
  setTimeout(() => {
    document.body.style.background = "#0f172a";
  }, 700);
}