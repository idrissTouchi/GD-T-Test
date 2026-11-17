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
  reviewFilter: "all"
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
  ["start", "quiz", "result"].forEach(function (n) {
    var el = $("#screen-" + n);
    if (el) el.hidden = n !== name;
  });
  window.scrollTo(0, 0);
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

/* ---------------- events ---------------- */

buildTopicPicker();
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
