import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  Img,
  Select,
  Switch,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SignedInContext } from "../App";
import { getUserData, updateCompMode } from "../firebase/helpers";
import { getYearValues, rangeLabel } from "../utils/stats";
import { BowlsContext } from "../context/BowlsContext";
import AddBowlModal from "./AddBowlModal";
import Stats from "./Stats";
import Leaderboard from "./Leaderboard";
import SpareShootingView from "./SpareShootingView";

const LoggedIn = () => {
  const { value } = useContext(SignedInContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const comingSoon = (feature) => {
    toast({
      title: `${feature} is coming soon!`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const [user, setUser] = useState(null);
  const [bowls, setBowls] = useState([]);
  const [practiceSessions, setPracticeSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState("all-time");

  const [toggle, setToggle] = useState(0);
  // Seeded from localStorage for an instant paint before Firestore loads;
  // refetch() then corrects it to whatever's saved on the user's profile, so
  // Comp mode follows you across devices instead of being per-browser.
  const [compMode, setCompModeState] = useState(
    () => localStorage.getItem("compMode") === "true"
  );
  const [view, setView] = useState("home");

  useEffect(() => {
    localStorage.setItem("compMode", compMode);
  }, [compMode]);

  // User-driven toggle: updates local state/cache immediately, and persists
  // to the profile so other devices pick it up on their next refetch().
  const setCompMode = (nextValue) => {
    setCompModeState(nextValue);
    if (value) updateCompMode(value, nextValue);
  };

  // Fetch the user document once; every stat/entry reads from `bowls` in
  // context instead of firing its own network read. Mutations call refetch().
  const refetch = useCallback(async () => {
    if (!value) return;
    setLoading(true);
    const data = await getUserData(value);
    setUser(data);
    setBowls(data?.bowls ?? []);
    setPracticeSessions(data?.practiceSessions ?? []);
    if (typeof data?.compMode === "boolean") {
      setCompModeState(data.compMode);
    }
    setLoading(false);
  }, [value]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Rolling-window presets sit between "all-time" and the specific calendar
  // years so Spare Shooting sessions (which might land in a month with no
  // logged games) still get a sensible range to filter by.
  const yearsList = useMemo(() => {
    const [allTime, ...calendarYears] = getYearValues([
      ...bowls,
      ...practiceSessions,
    ]);
    const sortedYears = [...calendarYears].sort((a, b) => Number(b) - Number(a));
    return [
      allTime,
      "last-1-month",
      "last-3-months",
      "last-6-months",
      ...sortedYears,
    ];
  }, [bowls, practiceSessions]);

  const handleYearChange = (event) => {
    const selectedValue = event.target.value;
    setYear(selectedValue);
  };

  const logout = () => {
    console.log("logging out!");
    localStorage.clear();
    window.location.reload();
  };

  return (
    <BowlsContext.Provider
      value={{
        bowls,
        practiceSessions,
        loading,
        refetch,
        compMode,
        setCompMode,
      }}
    >
    {view === "spareShooting" ? (
      <SpareShootingView onExit={() => setView("home")} />
    ) : (
    <Flex
      justify="space-between"
      alignItems="center"
      flexDirection="column"
      width="100%"
    >
      <HStack justify="space-between" className="header" width="100%">
        <Box w="30%">
          <Img src={`${process.env.PUBLIC_URL}/pin-tracker.png`} width="230px" alt="logo" />
        </Box>
        <Flex
          justifyContent="space-around"
          flexDirection={{ base: "column", md: "row" }}
          alignItems="center"
          w="30%"
        >
          <Text
            fontSize={{ base: "20px", sm: "25px" }}
            _hover={{ cursor: "pointer" }}
            color={toggle === 0 ? "#FDD468" : "white"}
            onClick={() => {
              setToggle(0);
            }}
            mr="10px"
          >
            Stats
          </Text>
          <Text
            fontSize={{ base: "20px", sm: "25px" }}
            _hover={{ cursor: "pointer" }}
            color={toggle === 0 ? "white" : "#FDD468"}
            onClick={() => {
              setToggle(1);
            }}
          >
            Leaderboard
          </Text>
        </Flex>
        <Box pr="40px" w="30%" textAlign="end">
          <Button
            w={{ base: "100px", sm: "120px" }}
            bgColor="#FFF3D2"
            border="2px solid #FDD468"
            _hover={{
              bgColor: "#E6DBBF",
            }}
            fontSize="17px"
            onClick={logout}
          >
            Log Out
          </Button>
        </Box>
      </HStack>

      <HStack justify="center" mt="10px" mb="5px" spacing="10px">
        <Text
          fontSize={{ base: "14px", sm: "16px" }}
          color={compMode ? "#FDD468" : "white"}
        >
          Comp
        </Text>
        <Switch
          colorScheme="yellow"
          size="lg"
          isChecked={compMode}
          onChange={(event) => setCompMode(event.target.checked)}
        />
      </HStack>

      <VStack>
        <Box textAlign="center" pb="17px">
          <Box
            display="flex"
            justifyContent="center"
            flexDirection={{ base: "column", md: "row" }}
            alignItems="center"
            mb="30px"
          >
            <Avatar boxSize="90px" src={user?.photoURL} alt="profile" />
            <Text pl="20px" fontSize="30px">
              Welcome {user?.firstName}
            </Text>
          </Box>
          <VStack spacing="10px">
            <Button
              onClick={onOpen}
              bgColor="#FFF3D2"
              border="2px solid #FDD468"
              _hover={{
                bgColor: "#E6DBBF",
              }}
            >
              {" "}
              <Text fontSize="20px" color="black" pr="6px">
                +
              </Text>{" "}
              Upload Bowl
            </Button>
            {compMode && (
              <>
                <Button
                  onClick={() => comingSoon("Live Game")}
                  bgColor="#FFF3D2"
                  border="2px solid #FDD468"
                  _hover={{
                    bgColor: "#E6DBBF",
                  }}
                >
                  {" "}
                  <Text fontSize="20px" color="black" pr="6px">
                    +
                  </Text>{" "}
                  Start Live Game
                </Button>
                <Button
                  onClick={() => setView("spareShooting")}
                  bgColor="#FFF3D2"
                  border="2px solid #FDD468"
                  _hover={{
                    bgColor: "#E6DBBF",
                  }}
                >
                  {" "}
                  <Text fontSize="20px" color="black" pr="6px">
                    +
                  </Text>{" "}
                  Spare Shooting
                </Button>
              </>
            )}
          </VStack>
          <AddBowlModal isOpen={isOpen} onClose={onClose} />
        </Box>

        <Select mb="20px" w="200px" value={year} onChange={handleYearChange}>
          {yearsList.map((rangeValue, id) => {
            return (
              <option value={rangeValue} key={id}>
                {rangeLabel(rangeValue)}
              </option>
            );
          })}
        </Select>
      </VStack>
      {toggle === 0 ? <Stats year={year} /> : <Leaderboard year={year} />}
    </Flex>
    )}
    </BowlsContext.Provider>
  );
};

export default LoggedIn;
