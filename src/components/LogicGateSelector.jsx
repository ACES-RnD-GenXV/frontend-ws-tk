import {
  Box,
  Heading,
  SimpleGrid,
  Button,
  VStack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

const LogicGateSelector = ({ onGateSelected, selectedGate }) => {
  const gates = [
    { id: "AND", label: "AND", description: "Both inputs must be TRUE" },
    { id: "OR", label: "OR", description: "At least one input must be TRUE" },
    { id: "XOR", label: "XOR", description: "Exactly one input must be TRUE" },
    { id: "NAND", label: "NAND", description: "Not both inputs TRUE" },
    { id: "NOR", label: "NOR", description: "Both inputs must be FALSE" },
    { id: "XNOR", label: "XNOR", description: "Both inputs must be the SAME" },
  ];

  const activeBg = useColorModeValue("blue.100", "blue.700");
  const hoverBg = useColorModeValue("gray.100", "gray.700");

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      mb={4}
      bg="white"
      boxShadow="sm"
    >
      <VStack spacing={4} align="flex-start">
        <Heading size="md">Select Logic Gate</Heading>

        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} width="100%">
          {gates.map((gate) => (
            <Button
              key={gate.id}
              maxW={"100%"}
              h="80px"
              onClick={() => onGateSelected(gate.id)}
              variant="outline"
              bg={selectedGate === gate.id ? activeBg : "transparent"}
              _hover={{ bg: selectedGate !== gate.id ? hoverBg : activeBg }}
              borderWidth={selectedGate === gate.id ? 2 : 1}
              borderColor={selectedGate === gate.id ? "blue.500" : "gray.200"}
            >
              <VStack
                spacing={0}
                maxW={"100%"}
                overflow={"hidden"}
                align="center"
              >
                <Text fontWeight="bold">{gate.label}</Text>
                <Text
                  fontSize="xs"
                  textAlign="center"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  as="div"
                >
                  <Box
                    as="marquee"
                    behavior="scroll"
                    direction="left"
                    scrollAmount="3"
                    width="100%"
                  >
                    {gate.description}
                  </Box>
                </Text>

                {/* <Text
                  fontSize="xs"
                  textAlign="center"
                  noOfLines={2}
                  wordBreak="break-word"
                  width="100%"
                >
                  {gate.description}
                </Text> */}
              </VStack>
            </Button>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default LogicGateSelector;
