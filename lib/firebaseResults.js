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


async function getValue(id) {
  const valuRef = child(results, id);
  const valueSnapshot = await get(valuRef);
  return valueSnapshot.val();
}


export async function saveMajorityVotes(result) {
  const resultsContent = await getValue('_results');
  const resultNumber = resultsContent != null && resultsContent.hasOwnProperty("majorVotesQuestion")
                        ? resultsContent.majorVotesQuestion.filter(_).length + 1 : 1;

  const childData = {
      question: result.question,
      sessionId: result.sessionId,
      createdOn: new Date().toLocaleString()
  };
  
  const ref = child(results, `/${'_results'}/majorVotesQuestion/${resultNumber}`);
  return set(ref, childData).catch((error) => error);
}