import { getDoc, getDocs, doc, collection, setDoc } from "@firebase/firestore";
import { db } from "./config";
import { averageData, filterByRange, highestGameData } from "../utils/stats";

// user functions
export const getUserData = async (id) => {
  const docRef = doc(db, "users", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
};

export const addUser = async (uid, name, email, photoURL) => {
  const docSnap = await getUserData(uid);
  if (docSnap == null) {
    let data = {
      email: email,
      name: name,
      firstName: name.split(" ")[0],
      uid: uid,
      photoURL: photoURL,
      bowls: [],
      practiceSessions: [],
      arsenal: [],
      journalEntries: [],
      average: null,
      highestGame: null,
      compMode: false,
      defaultThrowStyle: 1,
    };

    const userRef = doc(db, "users", uid);
    try {
      await setDoc(userRef, data);
    } catch (e) {
      console.error("error adding user: ", e);
    }
  }
};

// bowling functions
export const editBowl = async (id, uid, newData) => {
  const userData = await getUserData(uid);
  const { bowls } = userData;

  const updatedBowls = bowls.map((bowl) => (bowl.id === id ? newData : bowl));

  const docRef = doc(db, "users", uid);
  try {
    await setDoc(docRef, { bowls: updatedBowls }, { merge: true });
  } catch (error) {
    console.error("error editing bowl: ", error);
    // Re-thrown so the caller can detect an offline failure and keep the
    // edit form open / show a retry-friendly error instead of a false "Saved!".
    throw error;
  }
};

export const deleteBowl = async (id, uid) => {
  const userData = await getUserData(uid);
  const { bowls } = userData;
  const updatedBowls = bowls.filter((bowl) => bowl.id !== id);

  const docRef = doc(db, "users", uid);
  try {
    await setDoc(docRef, { bowls: updatedBowls }, { merge: true });
  } catch (e) {
    console.error("error deleting bowl: ", e);
    throw e;
  }
};

export const addBowl = async (uid, data) => {
  const userData = await getUserData(uid);
  const { bowls } = userData;
  const updatedBowls = [...bowls, data];

  const docRef = doc(db, "users", uid);
  try {
    await setDoc(docRef, { bowls: updatedBowls }, { merge: true });
  } catch (error) {
    console.error("error adding bowl: ", error);
    // Re-thrown so callers (e.g. Live Game) can tell a save actually failed
    // and keep their offline draft instead of discarding it.
    throw error;
  }
};

export const addPracticeSession = async (uid, data) => {
  const userData = await getUserData(uid);
  const practiceSessions = userData?.practiceSessions ?? [];
  const updatedSessions = [...practiceSessions, data];

  const docRef = doc(db, "users", uid);
  try {
    await setDoc(docRef, { practiceSessions: updatedSessions }, { merge: true });
  } catch (error) {
    console.error("error adding practice session: ", error);
    // Re-thrown so the caller can tell a save actually failed and keep its
    // offline draft instead of discarding it.
    throw error;
  }
};

export const editPracticeSession = async (id, uid, newData) => {
  const userData = await getUserData(uid);
  const practiceSessions = userData?.practiceSessions ?? [];
  const updatedSessions = practiceSessions.map((session) =>
    session.id === id ? newData : session
  );

  const docRef = doc(db, "users", uid);
  try {
    await setDoc(docRef, { practiceSessions: updatedSessions }, { merge: true });
  } catch (error) {
    console.error("error editing practice session: ", error);
    throw error;
  }
};

export const deletePracticeSession = async (id, uid) => {
  const userData = await getUserData(uid);
  const practiceSessions = userData?.practiceSessions ?? [];
  const updatedSessions = practiceSessions.filter((session) => session.id !== id);

  const docRef = doc(db, "users", uid);
  try {
    await setDoc(docRef, { practiceSessions: updatedSessions }, { merge: true });
  } catch (error) {
    console.error("error deleting practice session: ", error);
    throw error;
  }
};

// arsenal functions (Profile tab, Comp Mode)
export const addArsenalBall = async (uid, data) => {
  const userData = await getUserData(uid);
  const arsenal = userData?.arsenal ?? [];
  const updatedArsenal = [...arsenal, data];

  const docRef = doc(db, "users", uid);
  try {
    await setDoc(docRef, { arsenal: updatedArsenal }, { merge: true });
  } catch (error) {
    console.error("error adding ball: ", error);
    throw error;
  }
};

export const editArsenalBall = async (id, uid, newData) => {
  const userData = await getUserData(uid);
  const arsenal = userData?.arsenal ?? [];
  const updatedArsenal = arsenal.map((ball) => (ball.id === id ? newData : ball));

  const docRef = doc(db, "users", uid);
  try {
    await setDoc(docRef, { arsenal: updatedArsenal }, { merge: true });
  } catch (error) {
    console.error("error editing ball: ", error);
    throw error;
  }
};

export const deleteArsenalBall = async (id, uid) => {
  const userData = await getUserData(uid);
  const arsenal = userData?.arsenal ?? [];
  const updatedArsenal = arsenal.filter((ball) => ball.id !== id);

  const docRef = doc(db, "users", uid);
  try {
    await setDoc(docRef, { arsenal: updatedArsenal }, { merge: true });
  } catch (error) {
    console.error("error deleting ball: ", error);
    throw error;
  }
};

// journal functions (Profile tab, Comp Mode)
export const addJournalEntry = async (uid, data) => {
  const userData = await getUserData(uid);
  const journalEntries = userData?.journalEntries ?? [];
  const updatedEntries = [...journalEntries, data];

  const docRef = doc(db, "users", uid);
  try {
    await setDoc(docRef, { journalEntries: updatedEntries }, { merge: true });
  } catch (error) {
    console.error("error adding journal entry: ", error);
    throw error;
  }
};

export const editJournalEntry = async (id, uid, newData) => {
  const userData = await getUserData(uid);
  const journalEntries = userData?.journalEntries ?? [];
  const updatedEntries = journalEntries.map((entry) =>
    entry.id === id ? newData : entry
  );

  const docRef = doc(db, "users", uid);
  try {
    await setDoc(docRef, { journalEntries: updatedEntries }, { merge: true });
  } catch (error) {
    console.error("error editing journal entry: ", error);
    throw error;
  }
};

export const deleteJournalEntry = async (id, uid) => {
  const userData = await getUserData(uid);
  const journalEntries = userData?.journalEntries ?? [];
  const updatedEntries = journalEntries.filter((entry) => entry.id !== id);

  const docRef = doc(db, "users", uid);
  try {
    await setDoc(docRef, { journalEntries: updatedEntries }, { merge: true });
  } catch (error) {
    console.error("error deleting journal entry: ", error);
    throw error;
  }
};

export const updateCompMode = async (uid, compMode) => {
  const docRef = doc(db, "users", uid);
  try {
    await setDoc(docRef, { compMode }, { merge: true });
  } catch (error) {
    console.error("error updating comp mode: ", error);
  }
};

export const updateDefaultThrowStyle = async (uid, defaultThrowStyle) => {
  const docRef = doc(db, "users", uid);
  try {
    await setDoc(docRef, { defaultThrowStyle }, { merge: true });
  } catch (error) {
    console.error("error updating default throw style: ", error);
  }
};

// leaderboard functions (global, across all users)
const getAllUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map((docSnap) => docSnap.data());
};

export const globalGetHighestGameLeaderboard = async (year) => {
  const users = await getAllUsers();

  return users
    .map((user) => highestGameData(filterByRange(user.bowls ?? [], year), user.name))
    .filter((row) => row.max !== null)
    .sort((a, b) => b.max - a.max);
};

export const globalGetHighestAverageLeaderboard = async (year) => {
  const users = await getAllUsers();

  return users
    .map((user) => averageData(filterByRange(user.bowls ?? [], year), user.name))
    .filter((row) => row.average !== null)
    .sort((a, b) => b.average - a.average);
};
