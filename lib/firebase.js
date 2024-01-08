/**
 * Firebase API
 */

import { generateSessionId, generateRandomSeed } from "./random"
import { db } from "../firebase"
import {
  ref,
  set,
  update,
  child,
  get,
  onValue,
  increment,
} from "firebase/database"
import {
  GAME_STATES,
  MAX_PLAYERS,
  ROUND_STATES,
  VOTING_STATES,
  TRUE_DEFINITION,
} from "./constants"
import { sampleWord, getRandomFeature, getFeatures } from "./vocab"
import { saveMajorityVotes, getRandomMajorityVotes, getQuestionMajorVotes } from "./firebaseResults"
import { getQuestion } from "./firebaseQuestions"
import moment from "moment"

const sessions = ref(db, "sessions")
const questionsTable = ref(db, "questions")
const questions = "questions"

/**
 * Create a new session ID that does not clash with any of the existing IDs
 * @return {Promise<*>} a unique ID value
 */
async function createNewSessionId() {
  const id = generateSessionId()
  const sessionExists = await sessionIdExists(id)
  if (sessionExists) return createNewSessionId()
  else return id
}

/**
 * A helper function to get session data
 * @param sessionId
 * @return {Promise<{
 * id: string,
 * creator: string,
 * limit: number,
 * rounds: {
 *  number: number,
 *  dasher: string,
 *  word: string,
 *  state: string,
 *  seed: number,
 *  guesses: {player: string, guess: string, correct: boolean, correctVote: boolean, seed: number, votes: {player: boolean}}[]
 *  },
 * state: string,
 * players: {player: string, score: number}
 * }>}
 */
export async function getSessionValue(sessionId) {
  const sessionRef = child(sessions, sessionId)
  const sessionSnapshot = await get(sessionRef)
  return sessionSnapshot.val()
}

/**
 * Sync session data with the frontend
 * @param sessionId
 * @param setter
 */
export function syncSession(sessionId, setter) {
  const sessionRef = child(sessions, sessionId)
  onValue(sessionRef, (snapshot) => setter(snapshot.val()))
}

/**
 * Check if a particular session ID already exists
 * Note that if the function errors for some reason then it will return true out of fear of
 * overwriting an existing session and instead prompting another check
 * @param sessionId (string) the session ID key to check
 * @return (boolean) true if the session ID already exists, false otherwise
 */
export async function sessionIdExists(sessionId) {
  const sessionRef = child(sessions, sessionId)
  return get(sessionRef)
    .then((snapshot) => snapshot.exists())
    .catch((error) =>
      console.log(`Session ID check failed with error: ${error}`)
    )
}

/**
 * Create a new session in the database
 * After successfully joining a session, the creator also joins the session
 * @param creator (string) the name of the creator of the session
 * @param rounds (number) the number of rounds to play in the session
 * @return (Promise<Object>) a promise that contains an error (if present) and a session ID
 */
export async function initSession(creator, rounds, seconds, options) {
  const sessionId = await createNewSessionId()
  const initialState = {
    id: sessionId,
    creator: creator,
    state: GAME_STATES.INITIATED,
    limit: rounds,
    timer: seconds,
    defaultOptions: options,
    createdOn: new Date().toLocaleString(),
    roundNumber: 1,
    nextSessionId: "",
    _qIndex: 0,
  }
  return set(child(sessions, sessionId), initialState)
    .then(() => joinSession(sessionId, creator))
    .catch((error) => ({ sessionId: null, error }))
}

/**
 *
 * Create New Game for Next Round base from Round 1
 */
export async function newGameSession(baseSessionId) {
  const sessionData = await getSessionValue(baseSessionId)
  const rounds = sessionData.rounds;

  //save questions with majority votes
  let mvq = [];
  let qCounter = 0
  for (var x in rounds) {
    if (rounds[x].finalVote == "KEEP") {
      mvq.push(rounds[x].question);
      qCounter++; 
    }
  }
  if (mvq.length > 0) { await saveMajorityVotes(baseSessionId, mvq) }

  const keepOptions = []
  keepOptions.push("Q1")
  keepOptions.push("Q2")
  keepOptions.push("H2")

  const sessionId = await createNewSessionId()
  const initialState = {
    id: sessionId,
    creator: sessionData.creator,
    state: GAME_STATES.INITIATED,
    limit: qCounter,
    timer: sessionData.timer,
    defaultOptions: keepOptions,
    createdOn: new Date().toLocaleString(),
    voters: sessionData.voters,
    roundNumber: 2,
    nextSessionId: "",
    baseSessionId: baseSessionId,
    _qIndex: 0,
  }

  //previous session for next round flag
  const prevSessionRef = child(sessions, `/${baseSessionId}`)
  await update(prevSessionRef, {
    nextSessionId: sessionId,
    state: GAME_STATES.NEXTROUND,
  }).catch((error) => error)

  return set(child(sessions, sessionId), initialState)
    .then(() => ({ sessionId, error: null }))
    .catch((error) => ({ sessionId: null, error }))
}

export async function endSession(sessionId) {
  const sessionRef = child(sessions, `/${sessionId}`)
  return update(sessionRef, { state: GAME_STATES.ENDED }).catch(
    (error) => error
  )
}

/**
 * Check Question already voted
 * @param {*} sessionId
 * @param {*} roundNumber
 * @returns boolean
 */
export async function checkQuestionAlreadyVoted(sessionId, questionId) {
  const questionRef = child(sessions, `/${sessionId}/questions/${questionId}`)
  return get(questionRef)
    .then((snapshot) => snapshot.exists())
    .catch((error) =>
      console.log(`CheckQuestionAlreadyVoted failed with error: ${error}`)
    )
}

/**
 * Join a session
 * In order to join a session:
 *  (1) the session must exist,
 *  (2) the session must be accepting players, and
 *  (3) the username must not be taken
 * @param sessionId - session ID
 * @param username - username
 * @return {Promise<{sessionId: string|null, error: string|null}>}
 */
export async function joinSession(sessionId, username) {
  const sessionData = await getSessionValue(sessionId)
  const sessionVoters = sessionData.hasOwnProperty("voters")
    ? Object.keys(sessionData.voters)
    : []
  if (!(await sessionIdExists(sessionId)))
    return { sessionId: null, error: `Session ${sessionId} does not exist` }
  if (sessionVoters.includes(username))
    return { sessionId: null, error: `"${username}" is taken` }
  // if (
  //   !(
  //     sessionVoters.length < MAX_PLAYERS &&
  //     sessionData.state === GAME_STATES.INITIATED
  //   )
  // )
  //   return {
  //     sessionId: null,
  //     error: "This session is either full or has already started",
  //   }
  const sessionRef = child(sessions, sessionId)
  return set(child(sessionRef, `voters/${username}`), { votes: 0 })
    .then(() => ({ sessionId, error: null }))
    .catch((error) => ({ sessionId: null, error }))
}

/**
 * instantiate a new round.
 * NOTE: we are overwriting data of previous rounds because we don't need to keep track of them
 * @param sessionId
 * @return {Promise<void>}
 */
export async function newRound(sessionId, useKeepQuestions = false) {
  const sessionContent = await getSessionValue(sessionId)
  const roundNumber = sessionContent.hasOwnProperty("rounds")
    ? sessionContent.rounds.filter(_).length + 1
    : 1
  const voters = sessionContent.voters ? Object.keys(sessionContent.voters) : []
  const question = await getOrderedQuestion(sessionId)
  const dasher = sessionContent.creator
  const votes = Object.assign(
    {},
    ...voters
      .filter((p) => p != dasher)
      .map((p) => ({ [p]: { action: "", expire: 0, vote: "" } }))
  )

  const keepOptions = []
  keepOptions.push({ name: "Q1", votes: 0, rating: 0 })
  keepOptions.push({ name: "Q2", votes: 0, rating: 0 })
  keepOptions.push({ name: "H2", votes: 0, rating: 0 })

  const options = []
  sessionContent.defaultOptions &&
    sessionContent.defaultOptions.map((item, i) =>
      options.push({ name: item, votes: 0, rating: 0 })
    )

  const data = {
    number: roundNumber,
    dasher: dasher,
    question: question,
    state: useKeepQuestions ? ROUND_STATES.GUESSING : ROUND_STATES.SELECTING,
    votingState: VOTING_STATES.RUNNING,
    votingOptions: useKeepQuestions ? keepOptions : options,
    timeState: 0,
    totalVotes: 0,
    finalVote: "",
    endAt: "",
  }
  const roundRef = child(sessions, `/${sessionId}/rounds/${roundNumber}`)
  return set(roundRef, data)
    .then(() =>
      set(child(roundRef, "votes"), votes).catch((error) => console.log(error))
    )
    .catch((error) => error)
}

/**
 * get session rounds
 * @return {session data}
 */
export async function getSessionsRounds(sessionId) {
  return await getSessionValue(sessionId)
}

/**
 * get voting question
 */
export async function getVotingOption() {
  const feature = await getRandomFeature()
  return feature
}

/**
 * get random question
 */

export async function getRandomQuestion() {
  const questionRef = child(sessions, `/${questions}/_questions`)
  const questionSnapshot = await get(questionRef)
  const data = questionSnapshot.val()

  const keys = Object.keys(data)
  const index = Math.floor(Math.random() * keys.length)
  console.log(`selected question: ${keys[index]}`)
  return data[keys[index]]
}

/**
 * get random question
 */

export async function getOrderedQuestion(sessionId) {  
  console.log('getOrderedQuestion')
  const sessionRef = child(sessions, sessionId)
  const sessionContent = await getSessionValue(sessionId)
  
  const result = sessionContent.roundNumber == 1 
            ? await getQuestion(sessionContent._qIndex, sessionId)
            : await getQuestionMajorVotes(sessionContent._qIndex, sessionContent.baseSessionId, sessionId);
  if (!result.exceed) {
    await update(sessionRef, { _qIndex: sessionContent._qIndex + 1 });
  }

  const alreadyVoted = await checkQuestionAlreadyVoted(sessionId, result.question.id);
  if (result.question && sessionId && alreadyVoted) { 
    return getOrderedQuestion(sessionId) 
  }

  return result.question;
}

/**
 * get voting question
 * @return {void}
 */
export async function getAllVotingQuestion() {
  const features = await getFeatures()
  return features
}

/**
 * Start the session
 * @param sessionId
 * @return {Promise<void>}
 */
export async function startSession(sessionId) {
  const sessionRef = child(sessions, sessionId)
  return set(child(sessionRef, "state"), GAME_STATES.STARTED)
    .then(() => newRound(sessionId))
    .catch((error) => error)
}

export async function updateWord(sessionId, roundNumber) {
  const question = await getOrderedQuestion(sessionId); //await getRandomQuestion()
  const roundRef = child(sessions, `/${sessionId}/rounds/${roundNumber}`)
  return update(roundRef, {
    question: question,
    seed: generateRandomSeed(),
  }).catch((error) => error)
}

export async function updateRoundState(
  sessionId,
  roundNumber,
  state,
  options = [],
  timer
) {
  console.log("updateRoundState")
  const sessionData = await getSessionValue(sessionId)
  const endAt = moment()
    .add(timer ? timer : sessionData.timer, "seconds")
    .toLocaleString()
  const roundRef = child(sessions, `/${sessionId}/rounds/${roundNumber}`)

  if (state === ROUND_STATES.RESULTS) {
    const roundSnapshot = await get(roundRef)
    const roundData = roundSnapshot.val()
    let votingOptions = roundData.votingOptions
    let totalVotes = roundData.totalVotes

    for (var x in votingOptions) {
      const rating = (votingOptions[x].votes / totalVotes) * 100
      const optionRef = child(roundRef, `votingOptions/${x}`)
      await update(optionRef, { rating: rating }).catch((error) => error)
    }
  } else {
    const roundSnapshot = await get(roundRef)
    const roundData = roundSnapshot.val()
    const question = {
      id: roundData.question.id,
      description: roundData.question.description,
      title: roundData.question.title,
      round: roundNumber,
    }

    const questionRef = child(
      sessions,
      `/${sessionId}/${questions}/${question.id}`
    )
    const questionSnapshot = await get(questionRef)
    if (questionSnapshot.val() == null) {
      update(questionRef, question).catch((error) => error)
    }

    if (options.length > 0) {
      const roundOptions = []
      options &&
        options.map((item, i) =>
          roundOptions.push({ name: item, votes: 0, rating: 0 })
        )

      const sessionRef = child(sessions, sessionId)
      update(sessionRef, { timer })
      return update(roundRef, {
        state: state,
        endAt,
        votingOptions: roundOptions,
      }).catch((error) => error)
    }
  }

  const sessionRef = child(sessions, sessionId)
  update(sessionRef, { timer })
  return update(roundRef, { state, endAt }).catch((error) => error)
}

export async function updateRoundEndAt(sessionId, roundNumber, duration) {
  const roundRef = child(sessions, `/${sessionId}/rounds/${roundNumber}`)
  const roundSnapshot = await get(roundRef)
  const roundData = roundSnapshot.val()
  const endAt = moment(roundData.endAt)
    .add(duration, "seconds")
    .toLocaleString()

  return update(roundRef, {
    endAt,
  }).catch((error) => error)
}

export async function updateRoundFinalVote(sessionId, roundNumber, finalVote) {
  const roundRef = child(sessions, `/${sessionId}/rounds/${roundNumber}`)
  return update(roundRef, {
    finalVote,
  }).catch((error) => error)
}

export async function updateRoundVotingState(sessionId, roundNumber, state) {
  const roundRef = child(sessions, `/${sessionId}/rounds/${roundNumber}`)
  return update(roundRef, { votingState: state }).catch((error) => error)
}

export async function updateRoundTimeState(sessionId, roundNumber, state) {
  const roundRef = child(sessions, `/${sessionId}/rounds/${roundNumber}`)
  return update(roundRef, { time_state: state }).catch((error) => error)
}

export async function updateUserGuess(sessionId, roundNumber, username, guess) {
  const roundRef = child(sessions, `/${sessionId}/rounds/${roundNumber}`)
  return update(child(roundRef, `guesses/${username}`), {
    guess: guess,
    seed: generateRandomSeed(),
  }).catch((error) => error)
}

export async function updateUserVote(sessionId, roundNumber, username, vote) {
  const roundRef = child(sessions, `/${sessionId}/rounds/${roundNumber}`)
  const roundSnapshot = await get(roundRef)
  const roundData = roundSnapshot.val()

  return update(child(roundRef, `votes/${username}`), {
    vote: vote.name,
    seed: generateRandomSeed(),
    expire: 0,
  })
    .then((r) => {
      incrementOptionVote(sessionId, roundNumber, vote)
    })
    .catch((error) => error)
}

export async function deleteUserVote(sessionId, roundNumber, username, vote) {
  const roundRef = child(sessions, `/${sessionId}/rounds/${roundNumber}`)
  return update(child(roundRef, `votes/${username}`), {
    vote: "",
    seed: generateRandomSeed(),
    expire: 0,
  })
}

export async function incrementOptionVote(
  sessionId,
  roundNumber,
  vote,
  delta = 1
) {
  const roundRef = child(sessions, `/${sessionId}/rounds/${roundNumber}`)
  const optionRef = child(roundRef, `votingOptions/${vote.id}`)
  await update(roundRef, { totalVotes: increment(delta) }).catch(
    (error) => error
  )
  await update(optionRef, { votes: increment(delta) }).catch((error) => error)
}

export async function updateUserTimeExpire(
  sessionId,
  roundNumber,
  username,
  expire
) {
  const roundRef = child(sessions, `/${sessionId}/rounds/${roundNumber}`)
  return update(child(roundRef, `votes/${username}`), {
    expire: expire,
  }).catch((error) => error)
}

export async function updateUserActionVote(
  sessionId,
  roundNumber,
  username,
  action
) {
  const roundRef = child(sessions, `/${sessionId}/rounds/${roundNumber}`)
  return update(child(roundRef, `votes/${username}`), {
    expire: 0,
    action: action,
  }).catch((error) => error)
}

export async function incrementUserVote(sessionId, username, delta = 1) {
  const votersRef = child(sessions, `/${sessionId}/voters`)
  await update(child(votersRef, username), { votes: increment(delta) })
}

export async function updateUserIsCorrect(sessionId, roundNumber, username) {
  const roundRef = child(sessions, `/${sessionId}/rounds/${roundNumber}`)
  //await update(child(roundRef, `guesses/${username}`), { correct: true });
  await incrementUserVote(sessionId, username)
}

export async function castVote(sessionId, roundNumber, username, vote) {
  const roundRef = child(sessions, `/${sessionId}/rounds/${roundNumber}`)
  if (vote == TRUE_DEFINITION) {
    return update(child(roundRef, `guesses/${username}`), {
      correctVote: true,
    })
      .then(() => incrementUserScore(sessionId, username))
      .catch((error) => error)
  } else {
    return update(child(roundRef, `guesses/${vote}/votes`), {
      [username]: true,
    })
      .then(() => incrementUserScore(sessionId, vote))
      .catch((error) => error)
  }
}

/**
 * Import CSV
 * @param questions
 * @return {Promise<void>}
 */
export async function importQuestion(_questions) {
  _questions = await getFeatures()

  const questionRef = child(sessions, questions)
  const sessionSnapshot = await get(questionRef)
  const data = sessionSnapshot.val()
  const childData = {
    _questions: _questions,
    createdOn: new Date().toLocaleString(),
  }
  return set(child(sessions, questions), childData).catch((error) =>
    console.log(`Importing Questions error: ${error}`)
  )
}

export async function getAllImportedQuestions() {
  const questionsRef = child(questionsTable, "/_questions/imports")
  const questionSnapshot = await get(questionsRef)
  return questionSnapshot.val()
}

export async function getAllSessions() {
  const sessionsRef = child(sessions, "/")
  const sessionSnapshot = await get(sessionsRef)
  const val = sessionSnapshot.val()
  return val
}
