import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Circle,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  FormControl,
  FormLabel,
  Switch,
} from "@chakra-ui/react";

const OutputDisplay = ({
  result = false,
  buzzerFrequency = 2000,
  onBuzzerFrequencyChange,
  isBuzzerActive = true,
  onBuzzerActiveChange,
}) => {
  const handleFrequencyChange = (val) => {
    onBuzzerFrequencyChange(val);
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      mb={4}
      bg="white"
      boxShadow="sm"
    >
      <VStack spacing={4} align="flex-start" width="100%">
        <Heading size="md">Output Result</Heading>

        <HStack spacing={6} width="100%" justifyContent="center">
          <VStack>
            <Text fontWeight="bold">LED Status</Text>
            <HStack spacing={3}>
              <Circle size="30px" bg={result ? "gray.200" : "red.500"} />
              <Circle size="30px" bg={result ? "green.500" : "gray.200"} />
            </HStack>
            <Text fontSize="sm">{result ? "TRUE" : "FALSE"}</Text>
          </VStack>

          <VStack>
            <Text fontWeight="bold">Buzzer</Text>
            <Circle
              size="60px"
              bg={result && isBuzzerActive ? "blue.400" : "gray.200"}
              opacity={
                result && isBuzzerActive
                  ? (Math.sin(Date.now() / 100) + 1) / 2 + 0.5
                  : 1
              }
            />
          </VStack>
        </HStack>

        <VStack width="100%" spacing={4}>
          <FormControl
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <FormLabel htmlFor="buzzer-active" mb="0">
              Buzzer Active
            </FormLabel>
            <Switch
              id="buzzer-active"
              isChecked={isBuzzerActive}
              onChange={(e) => onBuzzerActiveChange(e.target.checked)}
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="buzzer-frequency">
              Buzzer Frequency: {buzzerFrequency} Hz
            </FormLabel>
            <Slider
              id="buzzer-frequency"
              min={500}
              max={5000}
              step={100}
              value={buzzerFrequency}
              onChange={handleFrequencyChange}
              isDisabled={!isBuzzerActive}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </FormControl>
        </VStack>
      </VStack>
    </Box>
  );
};

export default OutputDisplay;
