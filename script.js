function analyze() {
  let link = document.getElementById("link").value;
  let resultBox = document.getElementById("result");
  let explanationBox = document.getElementById("explanation");
  let loading = document.getElementById("loading");

  resultBox.style.opacity = 0;
  loading.style.display = "block";

  setTimeout(() => {

    loading.style.display = "none";

    if (!link) {
      resultBox.innerText = "⚠️ اكتب رابط أول";
      explanationBox.innerText = "";
      resultBox.style.opacity = 1;
      return;
    }

    let score = 100;
    let reasons = [];

    // 🔴 كلمات خطيرة
    if (link.includes("login") || link.includes("verify")) {
      score -= 25;
      reasons.push("كلمات تصيّد (Phishing)");
    }

    // 🔴 رموز أو بريد مشبوه
    if (link.includes("@")) {
      score -= 20;
      reasons.push("وجود @ داخل الرابط");
    }

    // 🔴 أرقام كثيرة
    let numbers = (link.match(/[0-9]/g) || []).length;
    if (numbers > 6) {
      score -= 15;
      reasons.push("أرقام كثيرة في الرابط");
    }

    // 🔴 شرطات كثيرة
    let dashes = (link.match(/-/g) || []).length;
    if (dashes > 3) {
      score -= 10;
      reasons.push("شرطات كثيرة");
    }

    // 🔴 دومينات مشبوهة
    if (link.includes(".xyz") || link.includes(".ru")) {
      score -= 30;
      reasons.push("دومين غير موثوق");
    }

    // 🟢 HTTPS أمان بسيط
    if (link.startsWith("https")) {
      score += 5;
    }

    // 🧠 مهم جدًا: ضبط الحدود
    if (score > 100) score = 100;
    if (score < 0) score = 0;

    // 🎯 تحديد النتيجة
    let status = "";
    let className = "";

    if (score >= 75) {
      status = "✅ آمن";
      className = "safe";
    } else if (score >= 40) {
      status = "⚠️ مشبوه";
      className = "warn";
    } else {
      status = "❌ خطير";
      className = "danger";
    }

    resultBox.className = "result " + className;
    resultBox.innerText = `${status} (${score}/100)`;

    explanationBox.innerText =
      reasons.length > 0
        ? "الأسباب: " + reasons.join(" - ")
        : "لا توجد مؤشرات خطورة واضحة";

    resultBox.style.opacity = 1;

  }, 800);
}

function clearInput() {
  document.getElementById("link").value = "";
  document.getElementById("result").innerText = "";
  document.getElementById("explanation").innerText = "";
}