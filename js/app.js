const elCheckbox = document.getElementById("darkMode");
const elWordInput = document.getElementById("word-input");
const section = document.getElementById("word-section");
const error = document.getElementById("error");
const elTitle = document.getElementById("title");
const elPronounciation = document.getElementById("pronounciation");
const nounSection = document.getElementById("noun-block");
const nounDefs = document.getElementById("noun-definitions");
const nounSynonyms = document.getElementById("noun-synonyms");
const nounSynonymsList = document.getElementById("noun-synonyms-list");
const verbSection = document.getElementById("verb-block");
const verbDefs = document.getElementById("verb-definitions");
const audioBtn = document.getElementById("audio-btn");
const audio = document.getElementById("audio");
const fontSelect = document.getElementById("font-select");

function reset() {
  nounSection.classList.add("hidden");
  verbSection.classList.add("hidden");
  nounSynonyms.classList.add("hidden");
  nounDefs.innerHTML = "";
  verbDefs.innerHTML = "";
}

function showError() {
  error.classList.remove("hidden");
}

function hideAll() {
  section.classList.add("hidden");
  error.classList.add("hidden");
}

let savedFont = localStorage.getItem("font") || "mono";
document.body.classList.add(`font-${savedFont}`);
fontSelect.value = savedFont;

fontSelect.addEventListener("change", (e) => {
  document.body.classList.remove(`font-${savedFont}`);

  savedFont = e.target.value;
  document.body.classList.add(`font-${savedFont}`);

  localStorage.setItem("font", savedFont);
});

if (localStorage.getItem("theme") === "light") {
  document.body.classList.remove("dark");
  elCheckbox.checked = false;
} else {
  document.body.classList.add("dark");
  elCheckbox.checked = true;
}

elCheckbox.addEventListener("change", () => {
  if (elCheckbox.checked) {
    document.body.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
});

elWordInput.addEventListener("change", (e) => {
  const word = e.target.value.trim();
  fetchWord(word);
});

function fetchWord(word) {
  hideAll();

  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then((res) => res.json())
    .then((data) => ui(data[0]))
    .catch(() => showError());
}

function ui(data) {
  section.classList.remove("hidden");
  error.classList.add("hidden");

  elTitle.textContent = data.word;
  elPronounciation.textContent = data.phonetic;

  reset();

  data.meanings.forEach((meaning) => {
    if (meaning.partOfSpeech === "noun") nounMeanings(meaning);
    if (meaning.partOfSpeech === "verb") verbMeanings(meaning);
  });

  playAudio(data.phonetics);
}

function nounMeanings(meaning) {
  nounSection.classList.remove("hidden");
  nounDefs.innerHTML = "";

  meaning.definitions.forEach((def) => {
    const li = document.createElement("li");
    li.textContent = def.definition;
    nounDefs.appendChild(li);
  });

  if (meaning.synonyms.length) {
    nounSynonyms.classList.remove("hidden");
    nounSynonymsList.textContent = meaning.synonyms.join(", ");
  }
}

function verbMeanings(meaning) {
  verbSection.classList.remove("hidden");
  verbDefs.innerHTML = "";

  meaning.definitions.forEach((def) => {
    const li = document.createElement("li");
    li.textContent = def.definition;
    verbDefs.appendChild(li);

    if (def.example) {
      const p = document.createElement("p");
      p.textContent = `"${def.example}"`;
      p.className = "example";
      verbDefs.appendChild(p);
    }
  });
}

function playAudio(phonetics) {
  const audioData = phonetics.find((p) => p.audio);

  if (!audioData) {
    audioBtn.classList.add("hidden");
    return;
  }

  audio.src = audioData.audio;
  audioBtn.classList.remove("hidden");
  audioBtn.onclick = () => audio.play();
}
