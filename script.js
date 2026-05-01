function analyze() {
  let link = document.getElementById("link").value.trim();
  let resultBox = document.getElementById("result");
  let explanationBox = document.getElementById("explanation");
  let loading = document.getElementById("loading");

  // 🔥 تأكد كل شيء يرجع طبيعي قبل البدء
  loading.style.display = "none";
  resultBox.style.opacity = 0;

  loading.style.display = "block";

  setTimeout(() => {

    try {

      loading.style.display = "none";

      // 🔥 تحقق أساسي
      if (!link) {
        showResult("❌ الرجاء إدخال رابط", "الحقل فارغ", "danger");
        return;
      }

      if (!link.startsWith("http")) {
        showResult("❌ الرابط غير صالح", "لا يبدأ بـ http/https", "danger");
        return;
      }

      // 🌐 استخراج الدومين
      let domain = "";
      try {
        domain = new URL(link).hostname;
      } catch {
        domain = link;
      }

      let score = 100;
      let reasons = [];

      // 🔴 روابط مختصرة
      if (domain.includes("bit.ly") || domain.includes("tinyurl")) {
        score -= 25;
        reasons.push("رابط مختصر");
      }

      // 🔴 Typosquatting
      let fakeWords = ["g00gle", "faceb00k", "paypa1", "micros0ft"];
      fakeWords.forEach(word => {
        if (link.includes(word)) {
          score -= 35;
          reasons.push("دومين مزيف (Typosquatting)");
        }
      });

      // 🔴 دومينات مشبوهة
      if (domain.endsWith(".xyz") || domain.endsWith(".ru") || domain.endsWith(".top")) {
        score -= 25;
        reasons.push("امتداد غير موثوق");
      }

      // 🔴 كلمات تصيّد
      if (link.includes("login") || link.includes("verify") || link.includes("secure")) {
        score -= 20;
        reasons.push("كلمات تصيّد");
      }

      // 🔴 @
      if (link.includes("@")) {
        score -= 20;
        reasons.push("وجود @");
      }

      // 🔴 طول الرابط
      if (link.length > 75) {
        score -= 10;
        reasons.push("رابط طويل");
      }

      // 🟢 HTTPS
      if (link.startsWith("https")) {
        score += 5;
      }

      // 🔥 ضبط الحدود
      score = Math.max(0, Math.min(100, score));

      let status = "";
      let className = "";

      if (score >= 80) {
        status = "✅ آمن";
        className = "safe";
      } else if (score >= 50) {
        status = "⚠️ مشبوه";
        className = "warn";
      } else {
        status = "❌ خطير";
        className = "danger";
      }

      showResult(
        `${status} (${score}/100)`,
        reasons.length ? reasons.join(" - ") : "لا توجد مؤشرات خطورة واضحة",
        className
      );

    } catch (error) {
      loading.style.display = "none";
      showResult("❌ خطأ في التحليل", "حدث خطأ غير متوقع", "danger");
    }

  }, 600);
}

// 🎯 عرض النتيجة
function showResult(text, explanation, className) {
  let resultBox = document.getElementById("result");
  let explanationBox = document.getElementById("explanation");

  resultBox.className = "result " + className;
  resultBox.innerText = text;
  explanationBox.innerText = explanation;

  resultBox.style.opacity = 1;
}

// 🧹 مسح
function clearInput() {
  document.getElementById("link").value = "";
  document.getElementById("result").innerText = "";
  document.getElementById("explanation").innerText = "";
  document.getElementById("loading").style.display = "none";
}