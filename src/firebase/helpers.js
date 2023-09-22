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
export const editBowl = async (id, uid, newData) => {
  const userData = await getUserData(uid);
  const { bowls } = userData;

  const updatedBowls = bowls.map((bowl) => {
    if (bowl.id === id) {
      console.log(bowl, " is the old bowl");
      console.log("gonna be replaced by ", newData);
      return newData;
    } else {
      return bowl;
    }
  });

  const docRef = doc(db, "users", uid);
  try {
    await setDoc(docRef, { bowls: updatedBowls }, { merge: true });
    console.log(
      "bowl edited! with the edited data being: ",
      newData,
      " the id is: ",
      id
    );
  } catch (error) {
    console.log("error editing this bowl w/ error of: ", error);
  }
};

export const deleteBowl = async (id, uid) => {
  const userData = await getUserData(uid);
  const { bowls } = userData;
  const updatedBowls = bowls.filter((bowl) => bowl.id !== id);

  const docRef = doc(db, "users", uid);
  try {
    await setDoc(docRef, { bowls: updatedBowls }, { merge: true });
    console.log("bowl is deleted of id: ", id);
  } catch (e) {
    console.log("error deleting bowl w/ id of ", id, " and error of: ", e);
  }
};

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

  if (bowls.length === 0) {
    return 0;
  }

  let res = 0;
  for (let i = 0; i < bowls.length; i++) {
    res += bowls[i].score;
  }

  let length = await gamesBowled(uid);
  let result = res / length;
  return +result.toFixed(2);
  // 888.88 = 0px (6)
  // 888.8 = 8px (5)
  // 888 = 25px (3)
};

export const allTimeAverageHand = async (uid, hand) => {
  const user = await getUserData(uid);
  const bowls = user?.bowls;

  if (bowls === null) {
    return null;
  }

  let res = 0;
  let length = 0;
  for (let i = 0; i < bowls.length; i++) {
    if (bowls[i].throwStyle === hand) {
      res += bowls[i].score;
      length++;
    }
  }

  if (length === 0) return 0;
  let result = res / length;
  return +result.toFixed(2);
};

export const last10GamesAverage = async (uid) => {
  const sorted = await sortBowlsScore(uid);
  if (sorted.length === 0) {
    return 0;
  }
  let res = 0;
  if (sorted.length < 10) {
    for (let i = 0; i < sorted.length; i++) {
      res += sorted[i].score;
    }
    res = res / sorted.length;
    res = +res.toFixed(2);
  } else {
    for (let i = 0; i < 10; i++) {
      res += sorted[i].score;
    }
    res = res / 10;
    res = +res.toFixed(2);
  }
  return res;
};

export const last10GamesHandAverage = async (uid, hand) => {
  const sorted = await sortBowlsDate(uid);

  if (sorted.length === 0) return 0;
  let res = 0;
  let counter = 0;
  let i = 0;
  while (counter < 10 && i < sorted.length) {
    if (hand === sorted[i].throwStyle) {
      res += sorted[i].score;
      counter++;
    }
    i++;
  }

  if (counter > 0) {
    res = res / counter;
    res = +res.toFixed(2);
    return res;
  } else {
    return 0;
  }
};

// ranking functions
export const sortBowlsScore = async (uid) => {
  const user = await getUserData(uid);
  const bowls = user?.bowls;

  if (bowls) {
    const sorted = bowls
      .sort((a, b) => {
        return a.score - b.score;
      })
      .reverse();

    return sorted;
  } else return [];
};

export const sortBowlsDate = async (uid) => {
  const user = await getUserData(uid);
  const bowls = user?.bowls;

  if (bowls) {
    const sorted = bowls
      .sort((a, b) => {
        return a.comparableDate - b.comparableDate;
      })
      .reverse();

    return sorted;
  } else return [];
};

export const getHighestGameDataLeaderboard = async (uid) => {
  const user = await getUserData(uid);

  const bowls = user?.bowls;
  let data = {};
  let max = null;
  let hand = null;
  let date = null;
  for (let i = 0; i < bowls.length; i++) {
    const bowl = bowls[i];
    if (max === null || bowl.score > max) {
      max = bowl.score;
      hand = bowl.throwStyle;
      date = bowl.date;
    }
  }
  data = {
    max,
    hand,
    date,
    name: user.name,
  };

  return data;
};

export const getAverageDataLeaderboard = async (uid) => {
  const user = await getUserData(uid);
  const bowls = user?.bowls;

  if (bowls === null) {
    return null;
  }

  if (bowls.length === 0) {
    return {
      name: user.name,
      average: null,
      gamesBowled: null,
    };
  }

  let res = 0;
  for (let i = 0; i < bowls.length; i++) {
    res += bowls[i].score;
  }

  let length = await gamesBowled(uid);
  let result = res / length;

  let data = {
    name: user.name,
    average: +result.toFixed(2),
    gamesBowled: length,
  };

  return data;
  // 888.88 = 0px (6)
  // 888.8 = 8px (5)
  // 888 = 25px (3)
};

// global users
export const globalGetHighestGameLeaderboard = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));

  const users = [];
  const usersData = [];

  querySnapshot.forEach((doc) => {
    const user = doc._document.data.value.mapValue.fields;
    users.push(user);
  });

  for (let i = 0; i < users.length; i++) {
    const { uid } = users[i];
    const data = await getHighestGameDataLeaderboard(uid.stringValue);

    usersData.push(data);
  }

  usersData.sort((a, b) => {
    return b.max - a.max;
  });

  return usersData;
};

export const globalGetHighestAverageLeaderboard = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));

  const users = [];
  const usersData = [];

  querySnapshot.forEach((doc) => {
    const user = doc._document.data.value.mapValue.fields;
    users.push(user);
  });

  for (let i = 0; i < users.length; i++) {
    const { uid } = users[i];
    const data = await getAverageDataLeaderboard(uid.stringValue);

    usersData.push(data);
  }

  usersData.sort((a, b) => {
    return b.average - a.average;
  });

  return usersData;
};
