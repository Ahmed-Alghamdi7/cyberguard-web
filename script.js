function analyze() {
  let link = document.getElementById("link").value.trim();
  let resultBox = document.getElementById("result");
  let explanationBox = document.getElementById("explanation");
  let loading = document.getElementById("loading");

  resultBox.style.opacity = 0;
  loading.style.display = "block";

  setTimeout(() => {

    loading.style.display = "none";

    // 🔥 تحقق أساسي
    if (!link) {
      showResult("❌ الرجاء إدخال رابط", "", "danger");
      return;
    }

    if (!link.startsWith("http")) {
      showResult("❌ الرابط غير صالح", "لا يبدأ بـ http/https", "danger");
      return;
    }

    // 🌐 استخراج الدومين الحقيقي
    let domain = "";
    try {
      domain = new URL(link).hostname;
    } catch {
      domain = link;
    }

    let score = 100;
    let reasons = [];

    // 🔴 1) روابط مختصرة
    if (domain.includes("bit.ly") || domain.includes("tinyurl")) {
      score -= 25;
      reasons.push("رابط مختصر يخفي الوجهة");
    }

    // 🔴 2) Typosquatting
    let fakeWords = ["g00gle", "faceb00k", "paypa1", "micros0ft"];
    fakeWords.forEach(word => {
      if (link.includes(word)) {
        score -= 35;
        reasons.push("دومين مزيف (Typosquatting)");
      }
    });

    // 🔴 3) دومينات مشبوهة
    if (domain.endsWith(".xyz") || domain.endsWith(".ru") || domain.endsWith(".top")) {
      score -= 25;
      reasons.push("امتداد غير موثوق");
    }

    // 🔴 4) كلمات تصيّد
    if (link.includes("login") || link.includes("verify") || link.includes("secure")) {
      score -= 20;
      reasons.push("كلمات تصيّد");
    }

    // 🔴 5) @ داخل الرابط
    if (link.includes("@")) {
      score -= 20;
      reasons.push("وجود @ (خطر إعادة توجيه)");
    }

    // 🔴 6) طول الرابط مبالغ فيه
    if (link.length > 75) {
      score -= 10;
      reasons.push("رابط طويل جدًا");
    }

    // 🟢 HTTPS
    if (link.startsWith("https")) {
      score += 5;
    }

    // 🔥 ضبط الحدود
    if (score > 100) score = 100;
    if (score < 0) score = 0;

    // 🎯 التصنيف
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

  }, 800);
}

// 🎯 دالة عرض النتيجة
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
}}