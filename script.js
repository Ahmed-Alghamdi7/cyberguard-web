function analyze() {
  let link = document.getElementById("link").value.trim();
  let resultBox = document.getElementById("result");
  let explanationBox = document.getElementById("explanation");
  let loading = document.getElementById("loading");

  loading.style.display = "none";
  resultBox.style.opacity = 0;

  loading.style.display = "block";

  setTimeout(() => {

    try {

      loading.style.display = "none";

      // ❌ فارغ
      if (!link) {
        showResult("❌ الرجاء إدخال رابط", "الحقل فارغ", "danger");
        return;
      }

      // ❌ رابط ناقص أو غير منطقي
      if (!link.includes(".")) {
        showResult("❌ هذا ليس رابطًا صحيحًا", "لا يحتوي على نطاق (domain)", "danger");
        return;
      }

      // 🌐 تحويل الرابط الحقيقي
      let url;
      try {
        url = new URL(link.startsWith("http") ? link : "http://" + link);
      } catch {
        showResult("❌ رابط غير صالح", "لا يمكن قراءته كرابط حقيقي", "danger");
        return;
      }

      let domain = url.hostname;

      let score = 100;
      let reasons = [];

      // 🔴 1) HTTP بدون أمان
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
        score -= 30;
        reasons.push("رابط مختصر يخفي الوجهة");
      }

      // 🔴 3) Typosquatting
      let fakeWords = ["g00gle", "faceb00k", "paypa1", "micros0ft"];
      fakeWords.forEach(word => {
        if (link.includes(word)) {
          score -= 40;
          reasons.push("دومين مزيف (Typosquatting)");
        }
      });

      // 🔴 4) دومينات مشبوهة
      if (
        domain.endsWith(".xyz") ||
        domain.endsWith(".ru") ||
        domain.endsWith(".top")
      ) {
        score -= 30;
        reasons.push("امتداد غير موثوق");
      }

      // 🔴 5) كلمات تصيّد
      if (
        link.includes("login") ||
        link.includes("verify") ||
        link.includes("secure")
      ) {
        score -= 20;
        reasons.push("كلمات تصيّد");
      }

      // 🔴 6) @ (خطر redirect)
      if (link.includes("@")) {
        score -= 25;
        reasons.push("استخدام @ لإخفاء الوجهة");
      }

      // 🔴 7) طول الرابط
      if (link.length > 80) {
        score -= 10;
        reasons.push("رابط طويل بشكل غير طبيعي");
      }

      // 🔴 8) subdomains كثيرة
      if (domain.split(".").length > 3) {
        score -= 15;
        reasons.push("نطاق فرعي مفرط (مشتبه)");
      }

      // 🟢 HTTPS bonus
      if (link.startsWith("https")) {
        score += 5;
      }

      // 🔥 ضبط الحدود
      score = Math.max(0, Math.min(100, score));

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