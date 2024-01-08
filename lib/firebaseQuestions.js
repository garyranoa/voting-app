/**
 * Firebase API Questions 
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
import { getFeatures } from "./vocab";

const questions = ref(db, "questions");
const sessions = ref(db, "sessions")


async function getValue(id) {
  const valuRef = child(questions, id);
  const valueSnapshot = await get(valuRef);
  return valueSnapshot.val();
}


/**
 * Import CSV from URL
 * @param questions
 * @return {Promise<void>}
 */
export async function importQuestion() {
    const _questions = await getFeatures();
    
    const questionsContent = await getValue('_questions');
    const importNumber = questionsContent != null && questionsContent.hasOwnProperty("imports")
                          ? questionsContent.imports.filter(_).length + 1 : 1;

    const childData = {
        _data: _questions,
        createdOn: new Date().toLocaleString()
    };
    
    const roundRef = child(questions, `/${'_questions'}/imports/${importNumber}`);
    return set(roundRef, childData).catch((error) => error);
  }

  /**
 * Import CSV from file
 * @param questions
 * @return {Promise<void>}
 */
  export async function importQuestionFromCSV(_questions) {
    const questionsContent = await getValue('_questions');
    const importNumber = questionsContent != null && questionsContent.hasOwnProperty("imports")
                          ? questionsContent.imports.filter(_).length + 1 : 1;

    const childData = {
        _data: _questions,
        createdOn: new Date().toLocaleString()
    };
    
    const roundRef = child(questions, `/${'_questions'}/imports/${importNumber}`);
    return set(roundRef, childData).catch((error) => error);
  }


  /**
 * get question order by ASC
 * @return {void}
 */

export async function getQuestion(index = 0, sessionId = "") {
  const questionsRef = child(questions, "/_questions/imports")
  const questionSnapshot = await get(questionsRef)

  const allQuestions = questionSnapshot.val().filter((f) => !!f)
  const rawQuestionsData = allQuestions[allQuestions.length - 1]._data
  const _questions = Object.values(rawQuestionsData)
  
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
  