import { VStack } from "@chakra-ui/react";
import React from "react";
import Arsenal from "./Arsenal";
import Journal from "./Journal";

// Comp Mode's third tab (see LoggedIn.js) — the balls you own and a tagged
// journal of things you're learning. Neither section is time-filtered, so
// this doesn't take a `year` prop the way Stats/Leaderboard do.
const Profile = () => {
  return (
    <VStack spacing="40px" pb="50px" w="100%" align="center">
      <Arsenal />
      <Journal />
    </VStack>
  );
};

export default Profile;
