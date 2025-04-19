import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  CircularProgress,
  CircularProgressLabel,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
} from "@chakra-ui/react";

const SensorReadingCard = ({
  title,
  value,
  unit = "cm",
  min = 0,
  max = 100,
  thresholdValue = 15,
  isActive = true,
}) => {
  // Calculate the percentage for the circular progress
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  // Determine if the sensor is triggered based on threshold
  const isTriggered = value <= thresholdValue;

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      mb={4}
      bg="white"
      boxShadow="sm"
      opacity={isActive ? 1 : 0.6}
    >
      <VStack spacing={3} align="center">
        <Heading size="md">{title}</Heading>

        <CircularProgress
          value={percentage}
          color={isTriggered ? "green.400" : "blue.400"}
          size="120px"
          thickness="8px"
        >
          <CircularProgressLabel fontSize="xl">
            {value !== null ? Math.round(value) : "--"}
          </CircularProgressLabel>
        </CircularProgress>

        <HStack spacing={2} justify="center" width="100%">
          <Text>{unit}</Text>
          <Badge colorScheme={isTriggered ? "green" : "gray"}>
            {isTriggered ? "Triggered" : "Not Triggered"}
          </Badge>
        </HStack>

        <Divider />

        <HStack justify="space-between" width="100%">
          <Stat size="sm">
            <StatLabel>Min</StatLabel>
            <StatNumber>{min}</StatNumber>
          </Stat>

          <Stat size="sm" textAlign="center">
            <StatLabel>Threshold</StatLabel>
            <StatNumber>{thresholdValue}</StatNumber>
          </Stat>

          <Stat size="sm" textAlign="right">
            <StatLabel>Max</StatLabel>
            <StatNumber>{max}</StatNumber>
          </Stat>
        </HStack>
      </VStack>
    </Box>
  );
};

export default SensorReadingCard;
