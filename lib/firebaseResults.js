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