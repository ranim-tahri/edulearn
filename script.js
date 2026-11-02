/* =========================================================
   Mini LMS - EduLearn : JavaScript
   1. Menu burger (délégation d'événements)
   2. Barre de lecture (haut de page)
   3. Stockage localStorage (progression, position, scores)
   4. Données des quiz
   5. Page d'accueil : progression + bouton « Reprendre »
   6. Quiz interactif (validation immédiate)
   7. Page de cours : modules, progression, position, quiz
   8. Navigation SPA : changer de page sans rechargement
   ========================================================= */

/* ---------- 1. Menu burger ----------
   On écoute le document entier (délégation) : ainsi le menu continue
   de fonctionner même quand la navigation SPA remplace l'en-tête. */
function fermerMenu() {
  const nav = document.getElementById("main-nav");
  const burger = document.querySelector(".burger");
  if (!nav || !burger) return;
  nav.classList.remove("open");
  burger.setAttribute("aria-expanded", "false");
  burger.setAttribute("aria-label", "Ouvrir le menu");
}

document.addEventListener("click", (e) => {
  const burger = e.target.closest(".burger");
  const nav = document.getElementById("main-nav");
  if (burger && nav) {
    const ouvert = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(ouvert));
    burger.setAttribute("aria-label", ouvert ? "Fermer le menu" : "Ouvrir le menu");
  } else if (e.target.closest("#main-nav a")) {
    fermerMenu();
  }
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") fermerMenu(); });

/* ---------- 2. Barre de progression de lecture ---------- */
function majLecture() {
  const barre = document.getElementById("reading-progress");
  if (!barre) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  barre.style.transform = `scaleX(${ratio})`;
}
window.addEventListener("scroll", majLecture, { passive: true });
window.addEventListener("resize", majLecture);

/* ---------- 3. Stockage (sauvegardé dans le navigateur) ---------- */
const CLE = "lms-progression";   // modules terminés   { html: [0, 2], ... }
const CLE_POS = "lms-position";  // dernier module vu  { html: 2, ... }
const CLE_QUIZ = "lms-quiz";     // meilleurs scores   { html: 3, ... }

function lireCle(cle) {
  try { return JSON.parse(localStorage.getItem(cle)) || {}; }
  catch (e) { return {}; }
}
function ecrireCle(cle, data) {
  try { localStorage.setItem(cle, JSON.stringify(data)); } catch (e) { /* stockage indisponible */ }
}
const lireProgression = () => lireCle(CLE);
const lirePosition = (id) => lireCle(CLE_POS)[id];
function ecrirePosition(id, index) {
  const data = lireCle(CLE_POS);
  data[id] = index;
  ecrireCle(CLE_POS, data);
}
function pourcentage(idCours, total) {
  const faits = (lireProgression()[idCours] || []).length;
  return total > 0 ? Math.round((faits / total) * 100) : 0;
}

/* Petit utilitaire pour créer un élément */
function el(tag, classe = "", texte = "") {
  const n = document.createElement(tag);
  if (classe) n.className = classe;
  if (texte) n.textContent = texte;
  return n;
}

/* ---------- 4. Données des quiz ----------
   "bonne" = numéro de la bonne réponse (0 = première option). */
const QUIZ = {
  html: [
    {
      q: "Quelle balise désigne le contenu principal (unique) d'une page ?",
      options: ["<div>", "<main>", "<section>", "<aside>"],
      bonne: 1,
      explication: "<main> contient le contenu principal et ne doit apparaître qu'une fois par page."
    },
    {
      q: "Quel attribut décrit une image pour les lecteurs d'écran ?",
      options: ["src", "title", "alt", "href"],
      bonne: 2,
      explication: "L'attribut alt fournit un texte alternatif : il est essentiel pour l'accessibilité."
    },
    {
      q: "Quelle balise crée un lien hypertexte ?",
      options: ["<link>", "<a>", "<nav>", "<href>"],
      bonne: 1,
      explication: "La balise <a> avec l'attribut href crée un lien. <link> sert à relier des ressources (CSS, icône)."
    }
  ],
  css: [
    {
      q: "Quelle déclaration active Flexbox sur un conteneur ?",
      options: ["display: flex;", "position: flex;", "flex: container;", "float: flex;"],
      bonne: 0,
      explication: "display: flex transforme l'élément en conteneur flex ; ses enfants deviennent des éléments flex."
    },
    {
      q: "Quelle media query cible les écrans d'au moins 768 px de large ?",
      options: ["@media (max-height: 768px)", "@screen 768px", "@media (min-width: 768px)", "@responsive (768px)"],
      bonne: 2,
      explication: "min-width: 768px s'applique à partir de 768 px : c'est l'approche mobile-first."
    },
    {
      q: "Comment créer 3 colonnes égales avec CSS Grid ?",
      options: [
        "grid-columns: 3;",
        "grid-template-columns: repeat(3, 1fr);",
        "columns: grid(3);",
        "grid-rows: 3 1fr;"
      ],
      bonne: 1,
      explication: "repeat(3, 1fr) répète 3 fois une colonne de largeur 1 fraction de l'espace disponible."
    }
  ],
  js: [
    {
      q: "Quel mot-clé déclare une variable qu'on ne peut pas réassigner ?",
      options: ["var", "let", "const", "static"],
      bonne: 2,
      explication: "const interdit la réassignation. let permet de changer la valeur."
    },
    {
      q: "Quelle méthode sélectionne le premier élément correspondant à un sélecteur CSS ?",
      options: ["document.getElementById()", "document.querySelector()", "document.createElement()", "document.getElementsByClassName()"],
      bonne: 1,
      explication: "querySelector accepte n'importe quel sélecteur CSS (#id, .classe, balise...)."
    },
    {
      q: "Quelle méthode attache un gestionnaire d'événement à un élément ?",
      options: ["addEventListener()", "attachClick()", "onEvent()", "listen()"],
      bonne: 0,
      explication: "element.addEventListener('click', fonction) exécute la fonction à chaque clic."
    }
  ]
};

/* ---------- 5. Page d'accueil ---------- */
function initAccueil() {
  document.querySelectorAll(".card[data-course]").forEach((carte) => {
    const id = carte.dataset.course;
    const total = Number(carte.dataset.total);
    const pct = pourcentage(id, total);
    carte.querySelector(".progress-fill").style.width = pct + "%";
    carte.querySelector(".progress-pct").textContent = pct + " %";
    carte.querySelector(".progress-track").setAttribute("aria-valuenow", String(pct));

    // Position sauvegardée : le bouton devient « Reprendre »
    const pos = lirePosition(id);
    const bouton = carte.querySelector(".btn");
    if (bouton && Number.isInteger(pos)) {
      bouton.textContent = `Reprendre (module ${pos + 1})`;
      bouton.setAttribute("href", bouton.getAttribute("href").split("#")[0] + "#module-" + (pos + 1));
    }
  });
}

/* ---------- 6. Quiz interactif ---------- */
function creerQuiz(idCours, panneau, questions, surScore) {
  let i = 0;
  let score = 0;
  const n = questions.length;

  function question(focus = false) {
    const q = questions[i];
    panneau.replaceChildren();

    const titre = el("h2", "", "Quiz du cours");
    titre.tabIndex = -1;
    panneau.append(titre, el("p", "quiz-meta", `Question ${i + 1} sur ${n}`));

    const piste = el("div", "progress-track");
    piste.setAttribute("aria-hidden", "true");
    const fill = el("div", "progress-fill");
    fill.style.width = (i / n) * 100 + "%";
    piste.append(fill);

    const liste = el("ul", "quiz-options");
    const retour = el("div", "quiz-feedback");
    retour.setAttribute("role", "status"); // annoncé par les lecteurs d'écran
    const actions = el("div", "quiz-actions");

    const boutons = q.options.map((texte, k) => {
      const li = el("li");
      const b = el("button", "quiz-option", texte);
      b.type = "button";
      b.addEventListener("click", () => {
        const juste = k === q.bonne;
        if (juste) score++;
        // Validation immédiate : on verrouille les réponses et on colore
        boutons.forEach((x, m) => {
          x.disabled = true;
          if (m === q.bonne) x.classList.add("ok");
          else if (m === k) x.classList.add("ko");
        });
        retour.className = "quiz-feedback " + (juste ? "ok" : "ko");
        retour.textContent = (juste ? "✅ Bonne réponse ! " : "❌ Mauvaise réponse. ") + q.explication;

        const suite = el("button", "btn", i === n - 1 ? "Voir mon résultat" : "Question suivante");
        suite.type = "button";
        suite.addEventListener("click", () => {
          i++;
          if (i < n) question(true); else resultat();
        });
        actions.append(suite);
        suite.focus();
      });
      li.append(b);
      liste.append(li);
      return b;
    });

    panneau.append(piste, el("p", "quiz-question", q.q), liste, retour, actions);
    if (focus) titre.focus();
  }

  function resultat() {
    const data = lireCle(CLE_QUIZ);
    const ancien = Number.isInteger(data[idCours]) ? data[idCours] : 0;
    const meilleur = Math.max(score, ancien);
    data[idCours] = meilleur;
    ecrireCle(CLE_QUIZ, data);
    surScore();

    const message = score === n ? "Parfait, vous maîtrisez ce cours !"
      : score >= n / 2 ? "Bien joué ! Relisez les modules pour progresser encore."
      : "Relisez les modules, puis retentez votre chance.";

    const titre = el("h2", "", "Résultat du quiz");
    titre.tabIndex = -1;
    const actions = el("div", "quiz-actions");
    const rejouer = el("button", "btn", "Recommencer le quiz");
    rejouer.type = "button";
    rejouer.addEventListener("click", demarrer);
    actions.append(rejouer);

    panneau.replaceChildren(
      titre,
      el("p", "quiz-score", `${score} / ${n}`),
      el("p", "", message),
      el("p", "quiz-meta", `Meilleur score : ${meilleur} / ${n}`),
      actions
    );
    titre.focus();
  }

  function demarrer() {
    i = 0;
    score = 0;
    question(true);
  }

  i = 0; score = 0;
  question(false);
}

/* ---------- 7. Page de cours ---------- */
function initCours() {
  const page = document.querySelector("[data-course-page]");
  if (!page) return;

  const idCours = page.dataset.coursePage;
  const modules = [...document.querySelectorAll(".module")];
  const liste = document.getElementById("module-list");
  if (!liste || modules.length === 0) return;

  const total = modules.length;
  const btnPrec = document.getElementById("btn-prev");
  const btnSuiv = document.getElementById("btn-next");
  const btnFait = document.getElementById("btn-done");
  const fill = document.getElementById("course-fill");
  const label = document.getElementById("course-pct");
  const track = document.getElementById("course-track");
  const barreNav = document.querySelector(".module-nav");

  let courant = 0;
  let faits = new Set(lireProgression()[idCours] || []);

  // Sommaire construit à partir des titres <h2> des modules
  modules.forEach((m, i) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.innerHTML = `<span class="check" aria-hidden="true">✓</span><span></span>`;
    b.lastElementChild.textContent = m.querySelector("h2").textContent;
    b.addEventListener("click", () => afficher(i));
    li.appendChild(b);
    liste.appendChild(li);
  });

  // Quiz : un panneau + un bouton dans le sommaire
  const questions = QUIZ[idCours];
  let panneau = null;
  let boutonQuiz = null;
  if (questions) {
    panneau = el("section", "module quiz-panel");
    panneau.id = "quiz";
    (document.querySelector(".module-content") || modules[0].parentElement).append(panneau);

    const li = el("li", "quiz-sep");
    boutonQuiz = el("button");
    boutonQuiz.type = "button";
    boutonQuiz.innerHTML = `<span class="quiz-ico" aria-hidden="true">🎯</span><span></span>`;
    const libelle = boutonQuiz.lastElementChild;
    const majBoutonQuiz = () => {
      const m = lireCle(CLE_QUIZ)[idCours];
      libelle.textContent = "Quiz du cours" + (Number.isInteger(m) ? ` (${m}/${questions.length})` : "");
    };
    majBoutonQuiz();
    boutonQuiz.addEventListener("click", () => afficherQuiz());
    li.append(boutonQuiz);
    liste.append(li);

    creerQuiz(idCours, panneau, questions, majBoutonQuiz);
  }

  const sauver = () => {
    const data = lireProgression();
    data[idCours] = [...faits];
    ecrireCle(CLE, data);
  };

  const majProgression = () => {
    const pct = Math.round((faits.size / total) * 100);
    fill.style.width = pct + "%";
    label.textContent = `${faits.size}/${total} modules (${pct} %)`;
    track.setAttribute("aria-valuenow", String(pct));
  };

  function afficher(i, defiler = true) {
    courant = Math.max(0, Math.min(i, total - 1));
    if (panneau) panneau.classList.remove("active");
    if (barreNav) barreNav.style.display = "";
    modules.forEach((m, k) => m.classList.toggle("active", k === courant));
    [...liste.children].forEach((li, k) => {
      const b = li.firstElementChild;
      li.classList.toggle("done", faits.has(k));
      if (k === courant) b.setAttribute("aria-current", "step");
      else b.removeAttribute("aria-current");
    });
    btnPrec.disabled = courant === 0;
    btnSuiv.disabled = courant === total - 1;
    btnFait.textContent = faits.has(courant) ? "✓ Module terminé" : "Marquer comme terminé";
    btnFait.classList.toggle("btn-success", faits.has(courant));
    majProgression();
    ecrirePosition(idCours, courant); // sauvegarde automatique de la position
    history.replaceState(null, "", "#module-" + (courant + 1));
    if (defiler) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function afficherQuiz(defiler = true) {
    modules.forEach((m) => m.classList.remove("active"));
    panneau.classList.add("active");
    if (barreNav) barreNav.style.display = "none";
    [...liste.children].forEach((li) => li.firstElementChild.removeAttribute("aria-current"));
    boutonQuiz.setAttribute("aria-current", "step");
    history.replaceState(null, "", "#quiz");
    if (defiler) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  btnPrec.addEventListener("click", () => afficher(courant - 1));
  btnSuiv.addEventListener("click", () => afficher(courant + 1));
  btnFait.addEventListener("click", () => {
    if (faits.has(courant)) faits.delete(courant); else faits.add(courant);
    sauver();
    afficher(courant, false);
  });

  // Démarrage : #quiz, sinon #module-N, sinon dernière position sauvegardée, sinon module 1
  const mHash = /^#module-(\d+)$/.exec(location.hash);
  const sauvee = lirePosition(idCours);
  if (panneau && location.hash === "#quiz") {
    afficherQuiz(false);
  } else {
    afficher(mHash ? Number(mHash[1]) - 1 : (Number.isInteger(sauvee) ? sauvee : 0), false);
  }
}

/* ---------- 8. Navigation SPA (sans rechargement) ----------
   Un clic sur un lien interne : on télécharge la page avec fetch(),
   on remplace le contenu du <body>, puis on met à jour l'URL avec
   l'API History. Si quelque chose échoue (ex. ouverture en file://),
   on retombe sur une navigation classique. */
let cheminAffiche = location.pathname;

function remplacerPage(doc) {
  document.title = doc.title;
  document.body.className = doc.body.className;
  // IMPORTANT : on recopie aussi les attributs data-* du <body> de la nouvelle page.
  // Sans cela, data-course-page garde la valeur de la première page chargée
  // (ex. "html") et le quiz, la progression et la position du mauvais cours s'affichent.
  [...document.body.attributes]
    .filter((a) => a.name.startsWith("data-"))
    .forEach((a) => document.body.removeAttribute(a.name));
  [...doc.body.attributes]
    .filter((a) => a.name.startsWith("data-"))
    .forEach((a) => document.body.setAttribute(a.name, a.value));
  const scripts = [...document.body.querySelectorAll("script")];      // on garde notre script
  const contenu = [...doc.body.children].filter((n) => n.tagName !== "SCRIPT");
  document.body.replaceChildren(...contenu, ...scripts);
}

async function naviguer(url, pousser = true) {
  try {
    const reponse = await fetch(url.href);
    if (!reponse.ok) throw new Error("HTTP " + reponse.status);
    const doc = new DOMParser().parseFromString(await reponse.text(), "text/html");
    if (!doc.body.querySelector("main")) throw new Error("page sans <main>");

    if (pousser) history.pushState(null, "", url.href);
    remplacerPage(doc);
    cheminAffiche = location.pathname;
    window.scrollTo(0, 0);
    initPage();
    if (url.hash && !/^#(module-|quiz)/.test(url.hash)) {
      const cible = document.querySelector(url.hash);
      if (cible) cible.scrollIntoView();
    }
  } catch (e) {
    location.href = url.href; // repli : navigation classique
  }
}

document.addEventListener("click", (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest("a[href]");
  if (!a || a.target || a.hasAttribute("download")) return;
  if (location.protocol === "file:") return;                  // fetch impossible en file://
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return;                 // lien externe
  if (!/\.html$|\/$/.test(url.pathname)) return;              // pas une page
  if (url.pathname === location.pathname) return;             // simple ancre (#cours...)
  e.preventDefault();
  naviguer(url);
});

// Boutons Précédent / Suivant du navigateur
window.addEventListener("popstate", () => {
  if (location.pathname !== cheminAffiche) naviguer(new URL(location.href), false);
});

/* ---------- Initialisation ---------- */
function initPage() {
  initAccueil();
  initCours();
  majLecture();
}
initPage();
