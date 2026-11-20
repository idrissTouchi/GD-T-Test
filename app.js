/* ------------------------------------------------------------------
   GD&T Interview Test — application logic
------------------------------------------------------------------- */

const $ = function (sel, root) { return (root || document).querySelector(sel); };
const $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

const state = {
  settings: null,
  items: [],
  answers: [],
  index: 0,
  mode: "exam",
  timer: null,
  elapsed: 0,
  startedAt: 0,
  reviewFilter: "all",
  returnTo: "start"
};

/* ---------------- helpers ---------------- */

function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

function topicById(id) {
  for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i].id === id) return TOPICS[i];
  return { id: id, name: id, sym: "s-dia" };
}

function fmt(seconds) {
  var m = Math.floor(seconds / 60);
  var s = seconds % 60;
  return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
}

function showScreen(name) {
  ["start", "courses", "quiz", "result", "certificate"].forEach(function (n) {
    var el = $("#screen-" + n);
    if (el) el.hidden = n !== name;
  });
  document.body.dataset.screen = name;
  window.scrollTo(0, 0);
}

function currentScreen() {
  var el = $(".screen:not([hidden])");
  return el ? el.id.replace("screen-", "") : "start";
}

/* ---------------- start screen ---------------- */

function buildTopicPicker() {
  var box = $("#topicList");
  box.innerHTML = TOPICS.map(function (t) {
    var n = QUESTIONS.filter(function (q) { return q.topic === t.id; }).length;
    return '<label class="topic">' +
      '<input type="checkbox" value="' + t.id + '" checked>' +
      '<span class="topic__box"></span>' +
      '<span class="topic__name">' + t.name + "</span>" +
      '<span class="topic__count">' + n + "</span>" +
      "</label>";
  }).join("");
}

function selectedTopics() {
  return $$("#topicList input:checked").map(function (i) { return i.value; });
}

function syncTopicLink() {
  var boxes = $$("#topicList input");
  var checked = boxes.filter(function (b) { return b.checked; }).length;
  $("#toggleTopics").textContent = checked === boxes.length ? "Clear all" : "Select all";
  if (checked > 0) $("#topicHint").hidden = true;
}

/* ---------------- test lifecycle ---------------- */

function startTest(settings) {
  var pool = QUESTIONS.filter(function (q) { return settings.topics.indexOf(q.topic) !== -1; });
  shuffle(pool);
  var chosen = settings.length === "all" ? pool : pool.slice(0, Math.min(Number(settings.length), pool.length));

  state.settings = { mode: settings.mode, length: settings.length, topics: settings.topics.slice() };
  state.mode = settings.mode;
  state.items = chosen.map(function (q) {
    var perm = shuffle(q.options.map(function (_, i) { return i; }));
    return {
      id: q.id,
      topic: q.topic,
      level: q.level,
      q: q.q,
      why: q.why,
      opts: perm.map(function (i) { return q.options[i]; }),
      correct: perm.indexOf(q.answer)
    };
  });
  state.answers = state.items.map(function () { return null; });
  state.index = 0;
  state.reviewFilter = "all";
  startTimer();
  showScreen("quiz");
  renderQuestion();
}

function startTimer() {
  clearInterval(state.timer);
  state.startedAt = Date.now();
  state.elapsed = 0;
  $("#timer").textContent = "00:00";
  state.timer = setInterval(function () {
    state.elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    $("#timer").textContent = fmt(state.elapsed);
  }, 500);
}

function stopTimer() {
  clearInterval(state.timer);
  state.timer = null;
}

/* ---------------- question screen ---------------- */

function renderQuestion() {
  var item = state.items[state.index];
  var topic = topicById(item.topic);
  var total = state.items.length;
  var chosen = state.answers[state.index];
  var reveal = state.mode === "practice" && chosen !== null;

  $("#qTopic").innerHTML = '<svg class="sym" aria-hidden="true"><use href="#' + topic.sym + '"/></svg><span>' + topic.name + "</span>";
  $("#qCounter").textContent = "Question " + (state.index + 1) + " of " + total;
  $("#qLevel").textContent = item.level;
  $("#progressFill").style.width = ((state.index + 1) / total * 100) + "%";
  $("#qText").innerHTML = rich(item.q);

  $("#optionList").innerHTML = item.opts.map(function (opt, i) {
    return '<button type="button" class="opt" data-i="' + i + '" role="radio" aria-checked="false">' +
      '<span class="opt__key">' + "ABCD"[i] + "</span>" +
      '<span class="opt__text">' + rich(opt) + "</span>" +
      '<span class="opt__mark"></span>' +
      "</button>";
  }).join("");

  $$("#optionList .opt").forEach(function (btn) {
    var i = Number(btn.dataset.i);
    btn.setAttribute("aria-checked", String(chosen === i));
    if (reveal) {
      btn.classList.add("is-locked");
      if (i === item.correct) {
        btn.classList.add("is-correct");
        btn.querySelector(".opt__mark").textContent = "Correct";
      } else if (i === chosen) {
        btn.classList.add("is-wrong");
        btn.querySelector(".opt__mark").textContent = "Your answer";
      } else {
        btn.classList.add("is-dim");
      }
    } else if (chosen === i) {
      btn.classList.add("is-selected");
    }
    btn.addEventListener("click", function () { selectOption(i); });
  });

  var fb = $("#feedback");
  if (reveal) {
    var ok = chosen === item.correct;
    fb.className = "feedback " + (ok ? "feedback--ok" : "feedback--bad");
    fb.innerHTML = "<strong>" + (ok ? "Correct" : "Not quite") + "</strong>" + rich(item.why);
    fb.hidden = false;
  } else {
    fb.hidden = true;
    fb.innerHTML = "";
  }

  $("#prevBtn").disabled = state.index === 0;
  $("#nextBtn").textContent = state.index === total - 1 ? "See my result" : "Next question";
}

function selectOption(i) {
  var item = state.items[state.index];
  if (state.mode === "practice" && state.answers[state.index] !== null) return;
  if (i < 0 || i >= item.opts.length) return;
  state.answers[state.index] = i;
  renderQuestion();
}

function nextQuestion() {
  if (state.index < state.items.length - 1) {
    state.index++;
    renderQuestion();
    window.scrollTo(0, 0);
  } else {
    finishTest();
  }
}

function prevQuestion() {
  if (state.index > 0) {
    state.index--;
    renderQuestion();
    window.scrollTo(0, 0);
  }
}

/* ---------------- results ---------------- */

function finishTest() {
  stopTimer();
  renderResults();
  showScreen("result");
}

function renderResults() {
  var total = state.items.length;
  var correct = 0, wrong = 0, skipped = 0;
  var perTopic = {};

  state.items.forEach(function (item, i) {
    var a = state.answers[i];
    if (!perTopic[item.topic]) perTopic[item.topic] = { total: 0, correct: 0 };
    perTopic[item.topic].total++;
    if (a === null) skipped++;
    else if (a === item.correct) { correct++; perTopic[item.topic].correct++; }
    else wrong++;
  });

  var pct = total ? Math.round(correct / total * 100) : 0;

  var bands = [
    { min: 90, title: "Outstanding", text: "You can defend every callout on the drawing. In an interview, go straight to the reasoning behind MMC, datum shift and composite frames — that is where you will stand out." },
    { min: 80, title: "Strong", text: "Solid working knowledge. Re-read the few topics below where you slipped, and rehearse explaining virtual condition and datum shift out loud." },
    { min: 70, title: "Pass", text: "You are above the suggested pass mark. The gaps below are usually the ones interviewers probe next, so turn them into your revision list." },
    { min: 50, title: "Needs work", text: "The fundamentals are there, but several core ideas need another pass — especially the tolerance modifiers and how the datum reference frame is built." },
    { min: 0, title: "Keep studying", text: "Start with Rule #1, the five symbol categories and how to read a feature control frame left to right. Those three unlock most of the other topics." }
  ];
  var band = bands.filter(function (b) { return pct >= b.min; })[0];

  $("#scorePct").textContent = pct + "%";
  $("#scoreFraction").textContent = correct + " / " + total;
  $("#verdict").textContent = band.title;
  $("#verdictText").textContent = band.text;
  $("#statCorrect").textContent = correct;
  $("#statWrong").textContent = wrong;
  $("#statSkipped").textContent = skipped;
  $("#statTime").textContent = fmt(state.elapsed);

  var perfect = total > 0 && correct === total;
  $("#certCta").hidden = !perfect;
  state.perfect = perfect;

  var circumference = 2 * Math.PI * 52;
  var ring = $("#ringFg");
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference;
  ring.style.stroke = pct >= 70 ? "var(--ok)" : pct >= 50 ? "var(--accent)" : "var(--bad)";
  requestAnimationFrame(function () {
    ring.style.strokeDashoffset = circumference * (1 - pct / 100);
  });

  var rows = TOPICS.filter(function (t) { return perTopic[t.id]; }).map(function (t) {
    var s = perTopic[t.id];
    var p = Math.round(s.correct / s.total * 100);
    var cls = p >= 70 ? "is-ok" : "is-bad";
    return '<div class="tscore">' +
      '<span class="tscore__name">' + t.name + "</span>" +
      '<span class="tscore__bar"><span class="' + cls + '" style="width:' + p + '%"></span></span>' +
      '<span class="tscore__val">' + s.correct + "/" + s.total + "</span>" +
      "</div>";
  });
  $("#topicScores").innerHTML = rows.join("");

  state.reviewFilter = "all";
  $$("#reviewTabs .tab").forEach(function (b) { b.classList.toggle("is-active", b.dataset.filter === "all"); });
  renderReview();
}

function renderReview() {
  var out = [];
  state.items.forEach(function (item, i) {
    var a = state.answers[i];
    var ok = a === item.correct;
    if (state.reviewFilter === "wrong" && ok) return;

    var topic = topicById(item.topic);
    var opts = item.opts.map(function (opt, j) {
      var cls = "rev__opt";
      if (j === item.correct) cls += " is-correct";
      else if (j === a) cls += " is-chosen-wrong";
      return '<li class="' + cls + '"><span class="k">' + "ABCD"[j] + "</span><span>" + rich(opt) + "</span></li>";
    }).join("");

    out.push(
      '<article class="rev ' + (ok ? "rev--ok" : "rev--bad") + '">' +
        '<div class="rev__head">' +
          '<span class="rev__num">Q' + (i + 1) + "</span>" +
          '<span class="rev__badge ' + (ok ? "ok" : "bad") + '">' +
            (a === null ? "Not answered" : ok ? "Correct" : "Incorrect") +
          "</span>" +
          '<span class="rev__badge">' + topic.name + "</span>" +
        "</div>" +
        '<p class="rev__q">' + rich(item.q) + "</p>" +
        '<ul class="rev__opts">' + opts + "</ul>" +
        '<p class="rev__why"><strong>Why:</strong> ' + rich(item.why) + "</p>" +
      "</article>"
    );
  });

  $("#reviewList").innerHTML = out.length
    ? out.join("")
    : '<p class="fineprint">Nothing here — every question was answered correctly.</p>';
}

/* ---------------- certificate ---------------- */

var CERT_ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCertId() {
  var bytes = new Uint8Array(8);
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (var b = 0; b < 8; b++) bytes[b] = Math.floor(Math.random() * 256);
  }
  var out = "";
  for (var i = 0; i < 8; i++) {
    if (i === 4) out += "-";
    out += CERT_ID_CHARS.charAt(bytes[i] % CERT_ID_CHARS.length);
  }
  return "GDT-" + out;
}

/* A visitor can claim the certificate once: the claim is remembered so the
   name cannot be changed afterwards to issue another one. */
var CERT_CLAIM_KEY = "gdt.certificate.claimed";

var claimInMemory = null;

function claimedCertificate() {
  var stored = null;
  try { stored = JSON.parse(window.localStorage.getItem(CERT_CLAIM_KEY) || "null"); }
  catch (e) { stored = null; }
  return stored || claimInMemory;
}

function applyClaimState() {
  var claim = claimedCertificate();
  var btn = $("#certOpenBtn");
  if (!claim || !btn) return;
  btn.disabled = true;
  btn.textContent = "Certificate already claimed";
  btn.setAttribute("title", "Issued to " + claim.name + " on " + claim.date);
  var note = $("#certCta .fineprint");
  if (note) note.textContent = "This certificate was already issued to " + claim.name +
    ". It cannot be claimed again, so the name cannot be changed.";
}

function openCertModal() {
  if (claimedCertificate()) return;
  $("#certError").hidden = true;
  $("#certModal").hidden = false;
  $("#certFirst").focus();
}

function closeCertModal() {
  $("#certModal").hidden = true;
}

/* The certificate is the A4-landscape artwork plus the recipient name. */
var CERT_W = 3508;
var CERT_H = 2480;
var certBackground = new Image();
var certBackgroundReady = false;
var certRecipient = "";
var certDateText = "";
var certIdText = "";

certBackground.onload = function () {
  certBackgroundReady = true;
  drawCertificate();
};
certBackground.src = "cert-bg.jpg";

function drawCertificate() {
  var canvas = $("#certCanvas");
  if (!canvas || !certBackgroundReady) return;

  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, CERT_W, CERT_H);
  ctx.drawImage(certBackground, 0, 0, CERT_W, CERT_H);
  if (!certRecipient) return;

  var size = 200;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#12178f";

  for (;;) {
    ctx.font = "700 " + size + 'px "Times New Roman", Georgia, "Liberation Serif", serif';
    if (ctx.measureText(certRecipient).width <= 2260 || size <= 84) break;
    size -= 4;
  }

  ctx.fillText(certRecipient, CERT_W / 2, 962);

  // Issue date and unique certificate ID, sitting on the rules above their labels.
  ctx.fillStyle = "#12178f";
  ctx.font = '700 52px "Times New Roman", Georgia, "Liberation Serif", serif';
  if (certDateText) ctx.fillText(certDateText, 1586, 2002);
  if (certIdText) ctx.fillText(certIdText, 2250, 2002);
}

var MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

/* Date of issue from the visitor's own clock (local calendar day). */
function formatIssueDate(d) {
  return MONTH_NAMES[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
}

function issueCertificate(first, last) {
  certRecipient = (first + " " + last).replace(/\s+/g, " ").trim();
  certDateText = formatIssueDate(new Date());
  certIdText = randomCertId();
  drawCertificate();

  claimInMemory = { name: certRecipient, date: certDateText, id: certIdText };
  try {
    window.localStorage.setItem(CERT_CLAIM_KEY, JSON.stringify(claimInMemory));
  } catch (e) { /* storage unavailable: the in-memory claim still holds */ }
  applyClaimState();
  closeCertModal();
  showScreen("certificate");
}

function pad10(n) {
  var s = String(n);
  while (s.length < 10) s = "0" + s;
  return s;
}

/* Build a one-page A4-landscape PDF that holds the rasterised certificate. */
function pdfFromJpeg(jpegBytes, imgW, imgH) {
  var pageW = 841.89;
  var pageH = 595.28;
  var enc = new TextEncoder();
  var parts = [];
  var offsets = [];
  var length = 0;

  function push(data) {
    var bytes = typeof data === "string" ? enc.encode(data) : data;
    parts.push(bytes);
    length += bytes.length;
  }

  function begin(n) { offsets[n] = length; }

  push("%PDF-1.4\n");

  begin(1);
  push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  begin(2);
  push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  begin(3);
  push("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + pageW + " " + pageH +
    "] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>\nendobj\n");

  var content = "q " + pageW + " 0 0 " + pageH + " 0 0 cm /Im0 Do Q\n";
  begin(4);
  push("4 0 obj\n<< /Length " + content.length + " >>\nstream\n" + content + "endstream\nendobj\n");

  begin(5);
  push("5 0 obj\n<< /Type /XObject /Subtype /Image /Width " + imgW + " /Height " + imgH +
    " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + jpegBytes.length +
    " >>\nstream\n");
  push(jpegBytes);
  push("\nendstream\nendobj\n");

  var xrefStart = length;
  var xref = "xref\n0 6\n0000000000 65535 f \n";
  for (var i = 1; i <= 5; i++) xref += pad10(offsets[i]) + " 00000 n \n";
  xref += "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" + xrefStart + "\n%%EOF\n";
  push(xref);

  return new Blob(parts, { type: "application/pdf" });
}

function saveBlob(blob, fileName) {
  var fileUrl = URL.createObjectURL(blob);
  var link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Embedded previews sandbox downloads and pop-ups away, so fall back to
  // showing the PDF in place (where it can still be opened and saved).
  var framed = false;
  try { framed = window.top !== window.self; } catch (e) { framed = true; }
  if (framed) {
    var tab = null;
    try { tab = window.open(fileUrl, "_blank"); } catch (e) { tab = null; }
    if (!tab) showDownloadNote();
  }

  setTimeout(function () { URL.revokeObjectURL(fileUrl); }, framed ? 60000 : 5000);
}

/* Embedded previews block file downloads; tell the visitor where to save it. */
function showDownloadNote() {
  var note = $("#certNote");
  if (!note) return;
  note.textContent = "Your preview panel blocked the download. Open the app in a browser tab (";
  var link = document.createElement("a");
  link.href = window.location.href;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = window.location.origin;
  note.appendChild(link);
  note.appendChild(document.createTextNode(") and download again to save the PDF."));
  note.hidden = false;
}

function downloadCertificate() {
  var canvas = $("#certCanvas");
  if (!canvas || !certBackgroundReady) {
    window.alert("The certificate is still loading. Please try again in a moment.");
    return;
  }

  var base64;
  try {
    base64 = canvas.toDataURL("image/jpeg", 0.95).split(",")[1];
  } catch (e) {
    window.alert("The certificate could not be exported: " + e.message);
    return;
  }
  var binary = atob(base64);
  var bytes = new Uint8Array(binary.length);
  for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  var safeName = certRecipient.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  saveBlob(pdfFromJpeg(bytes, CERT_W, CERT_H), "GDT-Certificate-" + (safeName || "achievement") + ".pdf");
}

/* ---------------- events ---------------- */

buildTopicPicker();
applyClaimState();
$("#chipCount").textContent = QUESTIONS.length + " questions";
syncTopicLink();

$("#topicList").addEventListener("change", syncTopicLink);

$("#toggleTopics").addEventListener("click", function () {
  var boxes = $$("#topicList input");
  var allChecked = boxes.every(function (b) { return b.checked; });
  boxes.forEach(function (b) { b.checked = !allChecked; });
  syncTopicLink();
});

$("#startBtn").addEventListener("click", function () {
  var topics = selectedTopics();
  if (!topics.length) {
    $("#topicHint").hidden = false;
    return;
  }
  var mode = ($('input[name="mode"]:checked') || {}).value || "exam";
  var length = ($('input[name="length"]:checked') || {}).value || "20";
  startTest({ mode: mode, length: length, topics: topics });
});

$("#coursesLink").addEventListener("click", function (e) {
  e.preventDefault();
  state.returnTo = currentScreen();
  showScreen("courses");
});

$("#coursesBack").addEventListener("click", function () {
  showScreen(state.returnTo || "start");
});

$("#coursesStart").addEventListener("click", function () {
  showScreen("start");
});

$("#certOpenBtn").addEventListener("click", openCertModal);
$("#certCloseBtn").addEventListener("click", closeCertModal);

$("#certModal").addEventListener("click", function (e) {
  if (e.target === $("#certModal")) closeCertModal();
});

$("#certForm").addEventListener("submit", function (e) {
  e.preventDefault();
  var first = $("#certFirst").value.trim();
  var last = $("#certLast").value.trim();
  var error = $("#certError");

  if (!first || !last) {
    error.textContent = "Please enter both your first name and last name.";
    error.hidden = false;
    (!first ? $("#certFirst") : $("#certLast")).focus();
    return;
  }

  error.hidden = true;
  issueCertificate(first, last);
});

$("#certBack").addEventListener("click", function () { showScreen("result"); });
$("#certDownload").addEventListener("click", downloadCertificate);

$("#prevBtn").addEventListener("click", prevQuestion);
$("#nextBtn").addEventListener("click", nextQuestion);

$("#endBtn").addEventListener("click", function () {
  var touched = state.answers.some(function (a) { return a !== null; });
  if (touched && !window.confirm("End the test now? Anything unanswered counts as wrong.")) return;
  finishTest();
});

$("#reviewTabs").addEventListener("click", function (e) {
  var btn = e.target.closest(".tab");
  if (!btn) return;
  state.reviewFilter = btn.dataset.filter;
  $$("#reviewTabs .tab").forEach(function (b) { b.classList.toggle("is-active", b === btn); });
  renderReview();
});

$("#retakeBtn").addEventListener("click", function () {
  if (!state.settings) return;
  startTest(state.settings);
});

$("#newBtn").addEventListener("click", function () {
  stopTimer();
  showScreen("start");
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !$("#certModal").hidden) { closeCertModal(); return; }
  if ($("#screen-quiz").hidden) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;

  var key = e.key.toLowerCase();
  var map = { a: 0, b: 1, c: 2, d: 3, "1": 0, "2": 1, "3": 2, "4": 3 };
  if (Object.prototype.hasOwnProperty.call(map, key)) {
    e.preventDefault();
    selectOption(map[key]);
    return;
  }
  if (e.key === "ArrowLeft") { e.preventDefault(); prevQuestion(); return; }
  if (e.key === "ArrowRight") {
    e.preventDefault();
    nextQuestion();
    return;
  }
  if (e.key === "Enter" && e.target.tagName !== "BUTTON") {
    e.preventDefault();
    nextQuestion();
  }
});
