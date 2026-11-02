# EduLearn – Mini plateforme de cours en ligne (mini LMS)

Mini-projet Web – Sujet 8 · FIA3 · ISSAT Sousse · A.U. 2026/2027
Encadrant : Mr. Sofiene Ben Ahmed
Réalisé par : **Étudiant 1** et **Étudiant 2**

## Description
EduLearn est une plateforme de cours (HTML5, CSS3, JavaScript) découpés en modules,
avec suivi de la progression, sauvegarde de la position et quiz interactifs.

## Fonctionnalités JavaScript
**Obligatoires**
- [x] Navigation entre les pages/cours sans rechargement (SPA simplifiée : `fetch` + History API)
- [x] Suivi de progression dynamique (pourcentage + checklist de modules)
- [x] Sauvegarde automatique de la position dans les cours (`localStorage`)
- [x] Quiz interactif avec validation immédiate et meilleur score sauvegardé

## Lancer le projet
Un serveur local est nécessaire (le `fetch` ne marche pas en `file://`) :
1. Installer VS Code et l'extension **Live Server**
2. Ouvrir le dossier du projet dans VS Code
3. Clic droit sur `index.html` → **Open with Live Server**

## Structure
```
index.html
style.css
script.js
images/
pages/
  cours-html.html
  cours-css.html
  cours-js.html
```


