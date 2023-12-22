/**
 * Firebase API Results
 */

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

const sessions = ref(db, "results");