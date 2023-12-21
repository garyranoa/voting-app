import path from 'path'

const papa = require("papaparse");

const VOCAB_URL1 = "https://raw.githubusercontent.com/ivan-rivera/balderdash-next/main/public/rare_words.csv";
// const VOCAB_URL =
//   "https://raw.githubusercontent.com/ivan-rivera/balderdash-next/main/public/test_rare_words.csv"

const VOCAB_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS1z0VRjtEbkN36jWfHRmUm3auwSlZAEnnbKYj_TmyK3UPAwXqiPx1vf0cgB3UIAJTODZmvjfhDZvXN/pub?output=csv";
const VOCAB_URL2 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8sTb7lMb-bIzJ6RWFQxXPzc8Ns0MYAOgGTXaBiTeyrieUeLeihRJ1Bg_1rMtvggbiX_VIJCv7fPXK/pub?output=csv"
let vocab = {};
export async function buildVocab() {
  await fetch(VOCAB_URL)
    .then((resp) => resp.text())
    .then((text) => {
      papa.parse(text, { header: true }).data.forEach((row) => {
        vocab[row.word] = row.definition;
      });
    });
}

export async function buildFeatures() {
  await fetch(VOCAB_URL)
    .then((resp) => resp.text())
    .then((text) => {
      papa.parse(text, { header: true }).data.forEach((row) => {
        vocab[row.ID] = {id : row.ID, title: row.Title, description: row.Description};
      });
    });
}

export async function buildFeaturesV2() {
  await fetch(VOCAB_URL)
    .then((resp) => resp.text())
    .then((text) => {
      papa.parse(text, { header: true }).data.forEach((row) => {
        vocab[row.ID] = {id : row.ID, title: row.Title, description: row.Description};
      });
    });
}


export async function getFeatures() {
  await buildFeaturesV2();
  return vocab;
}

export async function getRandomFeature() {
  await buildFeatures();
  const keys = Object.keys(vocab);
  const index = Math.floor(Math.random() * keys.length);
  console.log(`selected feature: ${keys[index]}`);
  return vocab[keys[index]];
}

export async function sampleWord() {
  await buildVocab();
  const keys = Object.keys(vocab);
  const index = Math.floor(Math.random() * keys.length);
  console.log(`selected word: ${keys[index]}`);
  return keys[index];
}

export async function getWordDefinition(word) {
  if (Object.keys(vocab).length === 0) await buildVocab();
  return vocab[word];
}
