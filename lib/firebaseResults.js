/**
 * Firebase API Results
 */
import { has } from 'lodash';
import { db } from "../firebase";
import {
  ref,
  set,
  update,
  child,
  get,
  onValue,
  increment,
} from "firebase/database";

const results = ref(db, "results");
const sessions = ref(db, "sessions")


async function getValue(id) {
  const valuRef = child(results, id);
  const valueSnapshot = await get(valuRef);
  return valueSnapshot.val();
}


export async function saveMajorityVotes(sessionId, questions) {

  const childData = {sessionId: sessionId, createdOn: new Date().toLocaleString() };
  const ref = child(results, `/${'_results'}/majorityVotesQuestion/${sessionId}`);
  await set(ref, childData).catch((error) => error);
  
  for (var x in questions) {
    const questionRef = child(ref, `/questions/${questions[x].id}`)
    const question = questions[x];
    update(questionRef, question).catch((error) => error)

  }
}

export async function getQuestionMajorVotes(index = 0, baseSessionId = "", sessionId) {
  const questionsRef = child(results, `/_results/majorityVotesQuestion/${baseSessionId}/questions`)
  const questionSnapshot = await get(questionsRef)

  const allQuestions = questionSnapshot.val();
  const _questions = Object.values(allQuestions)
  
  let exceed = false;
  if (index > _questions.length - 1) { 
    index = 0;
    const sessionRef = child(sessions, sessionId);
    await update(sessionRef, { _qIndex: 0 });
    exceed = true
  }
  const selected = _questions[index];
  //console.log(`selected question: `, selected)
  
  return { question: selected, exceed: exceed };
}

export async function getRandomMajorityVotes() {
  const questionRef = child(results, `/_results/majorVotesQuestion`)
  const questionSnapshot = await get(questionRef)
  const data = questionSnapshot.val()

  const keys = Object.keys(data)
  const index = Math.floor(Math.random() * keys.length)
  const selected = data[keys[index]].question;
  return selected;
}