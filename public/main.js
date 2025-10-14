const quizList = document.getElementById("quizList");
const startBtn = document.getElementById("startBtn");
const quizContainer = document.getElementById("quizContainer");
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const nextBtn = document.getElementById("nextBtn");

const uploadForm = document.getElementById("uploadForm");
const quizFile = document.getElementById("quizFile");
const uploadMsg = document.getElementById("uploadMsg");

const timerDisplay = document.createElement("div");
timerDisplay.className = "text-lg font-semibold text-blue-600 mb-3";
quizContainer.prepend(timerDisplay);

let quizData = null;
let current = 0;
let score = 0;
let timer;
let timeLeft = 30;
let answered = false;
let userAnswers = [];

// 🧩 Load available quizzes
async function loadQuizList() {
  const res = await fetch("/api/quizzes");
  const quizzes = await res.json();

  quizList.innerHTML = `<option value="">Select a quiz</option>`;
  quizzes.forEach(q => {
    const opt = document.createElement("option");
    opt.value = q;
    opt.textContent = q.replace(".json", "");
    quizList.appendChild(opt);
  });
}

// 📤 Handle file upload
uploadForm.addEventListener("submit", async e => {
  e.preventDefault();
  const file = quizFile.files[0];
  if (!file) return alert("Please select a file.");

  const formData = new FormData();
  formData.append("quizFile", file);

  uploadMsg.textContent = "Uploading...";
  uploadMsg.className = "text-gray-500";

  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (res.ok) {
      uploadMsg.textContent = "✅ " + data.message;
      uploadMsg.className = "text-green-600";
      loadQuizList();
      quizFile.value = "";
    } else {
      uploadMsg.textContent = "❌ " + data.error;
      uploadMsg.className = "text-red-600";
    }
  } catch {
    uploadMsg.textContent = "❌ Upload failed";
    uploadMsg.className = "text-red-600";
  }
});

// ▶️ Start selected quiz
async function startQuiz() {
  const quizName = quizList.value;
  if (!quizName) return alert("Select a quiz first!");

  const res = await fetch(`/api/quiz/${quizName}`);
  quizData = await res.json();

  // 🔀 Shuffle questions and options
  quizData.questions = shuffleArray(quizData.questions).map(q => {
    if (q.options) q.options = shuffleArray(q.options);
    return q;
  });

  current = 0;
  score = 0;
  userAnswers = [];

  document.getElementById("quiz-selector").classList.add("hidden");
  quizContainer.classList.remove("hidden");

  showQuestion();
}

// 🧠 Display one question
function showQuestion() {
  clearInterval(timer);
  answered = false;
  timeLeft = 30;
  updateTimer();

  const q = quizData.questions[current];
  questionText.textContent = `Q${current + 1}. ${q.question}`;
  optionsContainer.innerHTML = "";

  const options =
    q.type === "multiple" ? q.options : ["True", "False"];
  const shuffledOptions = shuffleArray([...options]);

  shuffledOptions.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.className =
      "w-full border px-4 py-2 rounded hover:bg-blue-100 transition-colors";
    btn.onclick = () => selectAnswer(btn, opt);
    optionsContainer.appendChild(btn);
  });

  timer = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timer);
      selectAnswer(null, null); // time’s up = no answer
    }
  }, 1000);
}

function updateTimer() {
  timerDisplay.textContent = `⏳ Time Left: ${timeLeft}s`;
}

// ✅ Handle answer
function selectAnswer(btn, choice) {
  if (answered) return;
  answered = true;
  clearInterval(timer);

  const correct = quizData.questions[current].answer;
  const buttons = optionsContainer.querySelectorAll("button");

  buttons.forEach(b => {
    b.disabled = true;
    if (b.textContent === correct) {
      b.classList.add("bg-green-200", "border-green-500");
    } else if (b === btn && choice !== correct) {
      b.classList.add("bg-red-200", "border-red-500");
    }
  });

  userAnswers.push({
    question: quizData.questions[current].question,
    userAnswer: choice || "No answer",
    correctAnswer: correct
  });

  if (choice === correct) score++;
  nextBtn.classList.remove("hidden");
}

// ⏭ Next question
nextBtn.onclick = () => {
  current++;
  nextBtn.classList.add("hidden");

  if (current < quizData.questions.length) {
    showQuestion();
  } else {
    showResult();
  }
};

// 🏁 Show final result with correct answers and user answers
function showResult() {
  quizContainer.innerHTML = `
    <h2 class="text-2xl font-bold mb-4">🎉 Quiz Finished!</h2>
    <p class="text-lg mb-4">You scored ${score} / ${quizData.questions.length}</p>
    <h3 class="text-xl font-semibold mb-2">📋 Review Answers:</h3>
    <ul class="text-left list-disc ml-6 mb-4 space-y-2">
      ${userAnswers
        .map(
          (ans, i) => `
        <li>
          <strong>Q${i + 1}:</strong> ${ans.question}<br>
          <span class="text-blue-600">Your Answer: ${ans.userAnswer}</span><br>
          <span class="text-green-600">Correct Answer: ${ans.correctAnswer}</span>
        </li>
      `
        )
        .join("")}
    </ul>
    <button onclick="window.location.reload()" 
      class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
      Restart
    </button>
  `;
}

// 🔀 Shuffle helper
function shuffleArray(array) {
  return array
    .map(a => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map(a => a.value);
}

startBtn.onclick = startQuiz;
loadQuizList();
