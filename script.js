function analyze() {
  let link = document.getElementById("link").value;

  let result = "";
  let explanation = "";

  if (!link) {
    result = "⚠️ اكتب رابط أول";
    explanation = "ما تم إدخال أي رابط";
  }
  else if (link.includes("login") || link.includes("verify") || link.includes("@")) {
    result = "⚠️ مشبوه";
    explanation = "قد يكون تصيّد (Phishing)";
  }
  else if (link.length < 10) {
    result = "❌ خطير";
    explanation = "الرابط قصير وغير طبيعي";
  }
  else {
    result = "✅ آمن غالبًا";
    explanation = "ما فيه علامات خطورة واضحة";
  }

  document.getElementById("result").innerText = result;
  document.getElementById("explanation").innerText = explanation;
}