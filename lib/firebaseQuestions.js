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
  