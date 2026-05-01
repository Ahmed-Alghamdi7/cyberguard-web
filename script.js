function analyze() {
  let link = document.getElementById("link").value;
  let resultBox = document.getElementById("result");
  let explanationBox = document.getElementById("explanation");
  let loading = document.getElementById("loading");

  resultBox.style.opacity = 0;
  loading.style.display = "block";

  setTimeout(() => {

    loading.style.display = "none";

    let score = 100;
    let reasons = [];

    if (!link) {
      resultBox.innerText = "⚠️ اكتب رابط أول";
      explanationBox.innerText = "";
      resultBox.style.opacity = 1;
      return;
    }

    if (link.includes("login") || link.includes("verify") || link.includes("@")) {
      score -= 30;
      reasons.push("كلمات مشبوهة");
    }

    if ((link.match(/[0-9]/g) || []).length > 5) {
      score -= 15;
      reasons.push("أرقام كثيرة");
    }

    if ((link.match(/-/g) || []).length > 3) {
      score -= 15;
      reasons.push("شرطات كثيرة");
    }

    if (link.includes(".xyz") || link.includes(".ru")) {
      score -= 25;
      reasons.push("دومين غير موثوق");
    }

    if (link.startsWith("https")) {
      score += 5;
    }

    let status = "";
    let className = "";

    if (score >= 70) {
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
    resultBox.innerText = status + " (" + score + "/100)";
    explanationBox.innerText = "السبب: " + (reasons.length ? reasons.join(" - ") : "لا توجد مؤشرات خطورة");

    resultBox.style.opacity = 1;

  }, 1000);
}

function clearInput() {
  document.getElementById("link").value = "";
  document.getElementById("result").innerText = "";
  document.getElementById("explanation").innerText = "";
}