import { Box, Button } from "@chakra-ui/react";
import React, { useContext, useEffect } from "react";
import { SignedInContext } from "../App";
import { auth, provider } from "../firebase/config";
import { signInWithPopup } from "firebase/auth";

const NotLoggedIn = () => {
  const { value, setValue } = useContext(SignedInContext);

  const handleClick = () => {
    signInWithPopup(auth, provider).then(({ user }) => {
      console.log(user, " is the data");
      const { uid, email, displayName, photoURL } = user;
      setValue(uid);

      localStorage.setItem("uid", uid);
    });
  };

  useEffect(() => {
    setValue(localStorage.getItem("uid"));
  }, []);

  return (
    <Box>
      <Button onClick={handleClick}>Click to sign in</Button>
    </Box>
  );
};

export default NotLoggedIn;
