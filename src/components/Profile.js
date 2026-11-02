import { VStack } from "@chakra-ui/react";
import React from "react";
import Arsenal from "./Arsenal";
import Events from "./Events";
import Journal from "./Journal";

// The Profile tab (see LoggedIn.js) — the balls you own, your leagues and
// tournaments, and a tagged journal of things you're learning. None of it is
// time-filtered, so this doesn't take a `year` prop the way Stats does.
const Profile = () => {
  return (
    <VStack spacing="40px" pb="50px" w="100%" align="center">
      <Arsenal />
      <Events />
      <Journal />
    </VStack>
  );
};

export default Profile;
