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
      average: null,
      highestGame: null,
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
