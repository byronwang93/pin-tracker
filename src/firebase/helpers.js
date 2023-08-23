import {
  addDoc,
  getDoc,
  getDocs,
  doc,
  collection,
  setDoc,
} from "@firebase/firestore";
import { db } from "./config";

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
      console.log("success!");
    } catch (e) {
      console.log("error is: ", e);
    }
  } else {
    console.log("user w/ the uid of ", uid, " already exists");
  }
};

// bowling functions
export const editBowl = () => {};

export const deleteBowl = () => {};

export const addBowl = async (uid, data) => {
  const bowlData = data;
  const userData = await getUserData(uid);
  const { bowls } = userData;
  const updatedBowls = [...bowls, bowlData];

  const docRef = doc(db, "users", uid);
  try {
    await setDoc(docRef, { bowls: updatedBowls }, { merge: true });
    console.log("doc update success!");
  } catch (error) {
    console.error("error updating document: ", error);
  }
};

// stats functions
export const gamesBowled = async (uid) => {
  const user = await getUserData(uid);
  return user?.bowls.length;
};

export const getHighestGame = async (uid) => {
  const user = await getUserData(uid);

  const bowls = user?.bowls;
  let max = null;
  for (let i = 0; i < bowls.length; i++) {
    const bowl = bowls[i];
    if (max === null || bowl.score > max) {
      max = bowl.score;
    }
  }
  return max;
};

export const getHighestGameHand = async (uid, hand) => {
  const user = await getUserData(uid);

  const bowls = user?.bowls;
  let max = null;
  for (let i = 0; i < bowls.length; i++) {
    const bowl = bowls[i];
    if (bowl.throwStyle === hand) {
      if (max === null || bowl.score > max) {
        max = bowl.score;
      }
    }
  }
  return max;
};

export const allTimeAverage = async (uid) => {
  const user = await getUserData(uid);
  const bowls = user?.bowls;

  if (bowls === null) {
    return null;
  }

  let res = 0;
  for (let i = 0; i < bowls.length; i++) {
    res += bowls[i];
  }

  let length = await gamesBowled(uid);
  return res / length;
};

export const allTimeAverageHand = async (uid, hand) => {};

export const last10GamesAverage = async (uid) => {};

export const last10GamesHandAverage = async (uid) => {};

// ranking functions
export const sortBowlsScore = async () => {};

export const sortBowlsDate = async () => {};
