import { useState, useEffect, useCallback } from "react";
import {
  ChakraProvider,
  Container,
  Stack,
  Heading,
  Box,
  SimpleGrid,
  Text,
  VStack,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import {
  DeviceDetailsCard,
  SensorReadingCard,
  LogicGateSelector,
  OutputDisplay,
  BLEDeviceScanner,
  BLEDeviceManager,
} from "./components";

// ESP32 BLE UUIDs
const ESP_SERVICE_UUID_INPUT = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const SENSOR_A_CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const SENSOR_B_CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a9";
const INPUT_CONTROL_CHAR_UUID_INPUT = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const ESP_SERVICE_UUID_OUTPUT = "4869e6e5-dec6-4a9d-a0a4-eda6b5448b97";
const OUTPUT_CONTROL_CHAR_UUID = "05c4d03a-ac78-4627-8778-f23fab166ba8";

function App() {
  // Device state
  const [inputDevice, setInputDevice] = useState(null);
  const [outputDevice, setOutputDevice] = useState(null);
  const [connectedInputDevice, setConnectedInputDevice] = useState(null);
  const [connectedOutputDevice, setConnectedOutputDevice] = useState(null);
  const [serviceData, setServiceData] = useState({});

  // Game state
  const [sensor1Value, setSensor1Value] = useState(0);
  const [sensor2Value, setSensor2Value] = useState(0);
  const [selectedGate, setSelectedGate] = useState("AND");
  const [buzzerFrequency, setBuzzerFrequency] = useState(2000);
  const [isBuzzerActive, setIsBuzzerActive] = useState(true);
  const [logicResult, setLogicResult] = useState(false);

  // Threshold values
  const [sensor1Threshold, setSensor1Threshold] = useState(30);
  const [sensor2Threshold, setSensor2Threshold] = useState(30);

  // Device Types
  const [connectingDeviceType, setConnectingDeviceType] = useState(null); // 'input' or 'output'

  // Modal controls
  const {
    isOpen: isDeviceModalOpen,
    onOpen: onDeviceModalOpen,
    onClose: onDeviceModalClose,
  } = useDisclosure();
  const {
    isOpen: isSettingsModalOpen,
    onOpen: onSettingsModalOpen,
    onClose: onSettingsModalClose,
  } = useDisclosure();

  // Send output state to ESP32
  const sendOutputToESP = useCallback(
    (result) => {
      if (!serviceData[ESP_SERVICE_UUID_OUTPUT]?.[OUTPUT_CONTROL_CHAR_UUID])
        return;

      const outputChar =
        serviceData[ESP_SERVICE_UUID_OUTPUT][OUTPUT_CONTROL_CHAR_UUID];

      // Create a buffer with the output data
      // Format: [result (1 byte), buzzer_active (1 byte), frequency (2 bytes)]
      // const buffer = new ArrayBuffer(4);
      // const view = new DataView(buffer);

      // view.setUint8(0, result ? 1 : 0);
      // view.setUint8(1, isBuzzerActive ? 1 : 0);
      // view.setUint16(2, buzzerFrequency, true); // true for little-endian

      // console.log("Sending output to ESP:", {
      //   result,
      //   isBuzzerActive,
      //   buzzerFrequency,
      // });
      // console.log("Buffer to send:", buffer);
      // console.log("Buffer view:", view);

      const te = new TextEncoder();

      outputChar.writeValue(te.encode(result ? 1 : 0));
    },
    [serviceData]
  );

  // useEffect(() => {
  //   const result = "1";
  //   if (
  //     connectedOutputDevice &&
  //     serviceData[ESP_SERVICE_UUID_OUTPUT]?.[OUTPUT_CONTROL_CHAR_UUID]
  //   ) {
  //     console.log("Sending output to ESP:", result);
  //     sendOutputToESP(result);
  //   }
  // }, [connectedOutputDevice, serviceData, sendOutputToESP]);

  const testSendOutput = () => {
    console.log("Testing send output");
    console.log(connectedOutputDevice);
    console.log(serviceData);
    const logicResult = "1";
    if (
      connectedOutputDevice &&
      serviceData[ESP_SERVICE_UUID_OUTPUT]?.[OUTPUT_CONTROL_CHAR_UUID]
    ) {
      console.log("Sending test output to ESP ", logicResult);
      sendOutputToESP(logicResult);
    }
  };

  // Update logic result when sensor values or selected gate changes
  useEffect(() => {
    const input1 = sensor1Value <= sensor1Threshold;
    const input2 = sensor2Value <= sensor2Threshold;

    let result = false;

    switch (selectedGate) {
      case "AND":
        result = input1 && input2;
        break;
      case "OR":
        result = input1 || input2;
        break;
      case "XOR":
        result = input1 !== input2;
        break;
      case "NAND":
        result = !(input1 && input2);
        break;
      case "NOR":
        result = !(input1 || input2);
        break;
      case "XNOR":
        result = input1 === input2;
        break;
      default:
        result = false;
    }

    setLogicResult(result);

    // If we have a connected output device, send the result
    if (
      connectedOutputDevice &&
      serviceData[ESP_SERVICE_UUID_OUTPUT]?.[OUTPUT_CONTROL_CHAR_UUID]
    ) {
      sendOutputToESP(result);
    }
  }, [
    sensor1Value,
    sensor2Value,
    selectedGate,
    sensor1Threshold,
    sensor2Threshold,
    connectedOutputDevice,
    serviceData,
    sendOutputToESP,
  ]);

  // Setup notifications for sensor readings
  const setupSensorNotifications = useCallback(() => {
    if (!serviceData[ESP_SERVICE_UUID_INPUT]) return;

    // Sensor 1 notifications
    const sensor1Char = serviceData[ESP_SERVICE_UUID_INPUT][SENSOR_A_CHAR_UUID];
    if (sensor1Char) {
      sensor1Char.startNotifications().then(() => {
        sensor1Char.addEventListener("characteristicvaluechanged", (event) => {
          const value = event.target.value;
          const distance = value.getUint16(0, true); // Assuming the ESP32 sends a uint16 with distance in cm
          setSensor1Value(distance);
        });
      });
    }

    // Sensor 2 notifications
    const sensor2Char = serviceData[ESP_SERVICE_UUID_INPUT][SENSOR_B_CHAR_UUID];
    if (sensor2Char) {
      sensor2Char.startNotifications().then(() => {
        sensor2Char.addEventListener("characteristicvaluechanged", (event) => {
          const value = event.target.value;
          const distance = value.getUint16(0, true);
          setSensor2Value(distance);
        });
      });
    }
  }, [serviceData]);

  // Handle device connection
  const handleDeviceConnected = useCallback(
    (device, type) => {
      if (type === "input") {
        setConnectedInputDevice(device);
        // Setup sensor data notifications
        if (serviceData[ESP_SERVICE_UUID_INPUT]) {
          setupSensorNotifications(device);
        }
      } else {
        setConnectedOutputDevice(device);
        // Send current output state
        if (serviceData[ESP_SERVICE_UUID_OUTPUT]) {
          sendOutputToESP(logicResult);
        }
      }
    },
    [serviceData, logicResult, setupSensorNotifications, sendOutputToESP]
  );

  // Effect to handle newly connected devices
  useEffect(() => {
    if (inputDevice) {
      handleDeviceConnected(inputDevice, "input");
    }
  }, [inputDevice, handleDeviceConnected]);

  useEffect(() => {
    if (outputDevice) {
      handleDeviceConnected(outputDevice, "output");
    }
  }, [outputDevice, handleDeviceConnected]);

  // Handle buzzer frequency change
  const handleBuzzerFrequencyChange = useCallback(
    (value) => {
      setBuzzerFrequency(value);

      // Send updated output
      if (
        connectedOutputDevice &&
        serviceData[ESP_SERVICE_UUID_OUTPUT]?.[OUTPUT_CONTROL_CHAR_UUID]
      ) {
        sendOutputToESP(logicResult);
      }
    },
    [connectedOutputDevice, serviceData, logicResult, sendOutputToESP]
  );

  // Handle buzzer active change
  const handleBuzzerActiveChange = useCallback(
    (value) => {
      setIsBuzzerActive(value);

      // Send updated output
      if (
        connectedOutputDevice &&
        serviceData[ESP_SERVICE_UUID_OUTPUT]?.[OUTPUT_CONTROL_CHAR_UUID]
      ) {
        sendOutputToESP(logicResult);
      }
    },
    [connectedOutputDevice, serviceData, logicResult, sendOutputToESP]
  );

  return (
    <Stack maxW="100vw" py={8} px={4} spacing={8} align="center">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center" mb={8}>
          <Heading as="h1" size="xl">
            Logic Gate Learning Tool
          </Heading>
          <Text fontSize="lg" mt={2}>
            Connect BLE devices, select logic gates, and see real-time results
          </Text>
        </Box>

        {/* Device connection section */}
        <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Box>
              <Heading as="h3" size="md" mb={2}>
                Input Device
              </Heading>
              {inputDevice ? (
                <BLEDeviceManager
                  device={inputDevice}
                  serviceUUIDs={[ESP_SERVICE_UUID_INPUT]}
                  onConnected={(device) => {
                    setConnectedInputDevice(device);
                  }}
                  onDisconnected={() => setConnectedInputDevice(null)}
                  onServicesDiscovered={(services) => {
                    setServiceData((prev) => ({ ...prev, ...services }));
                    // After services are discovered, set up notifications
                    setupSensorNotifications();
                  }}
                />
              ) : (
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    setConnectingDeviceType("input");
                    onDeviceModalOpen();
                  }}
                >
                  Connect Input Device
                </Button>
              )}
            </Box>

            <Box>
              <Heading as="h3" size="md" mb={2}>
                Output Device
              </Heading>
              {outputDevice ? (
                <>
                  // And for output device:
                  <BLEDeviceManager
                    device={outputDevice}
                    serviceUUIDs={[ESP_SERVICE_UUID_OUTPUT]}
                    onConnected={(device) => {
                      setConnectedOutputDevice(device);
                    }}
                    onDisconnected={() => {
                      setConnectedOutputDevice(null);
                    }}
                    onServicesDiscovered={(services) => {
                      setServiceData((prev) => ({ ...prev, ...services }));
                      // After services are discovered, send output state
                      sendOutputToESP(logicResult);
                    }}
                  />
                  <Button onClick={testSendOutput} colorScheme="teal">
                    Test Send Output
                  </Button>
                </>
              ) : (
                <Button
                  colorScheme="green"
                  onClick={() => {
                    setConnectingDeviceType("output");
                    onDeviceModalOpen();
                  }}
                >
                  Connect Output Device
                </Button>
              )}
            </Box>
          </SimpleGrid>
        </Box>

        {/* Logic gate game section */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {/* Sensor 1 */}
          <SensorReadingCard
            title="Sensor 1"
            value={sensor1Value}
            threshold={sensor1Threshold}
            onThresholdChange={setSensor1Threshold}
            isActive={sensor1Value <= sensor1Threshold}
          />

          {/* Logic Gate */}
          <LogicGateSelector
            selectedGate={selectedGate}
            onGateChange={setSelectedGate}
            input1={sensor1Value <= sensor1Threshold}
            input2={sensor2Value <= sensor2Threshold}
            result={logicResult}
          />

          {/* Sensor 2 */}
          <SensorReadingCard
            title="Sensor 2"
            value={sensor2Value}
            threshold={sensor2Threshold}
            onThresholdChange={setSensor2Threshold}
            isActive={sensor2Value <= sensor2Threshold}
          />
        </SimpleGrid>

        {/* Output display */}
        <OutputDisplay
          result={logicResult}
          buzzerFrequency={buzzerFrequency}
          onBuzzerFrequencyChange={handleBuzzerFrequencyChange}
          isBuzzerActive={isBuzzerActive}
          onBuzzerActiveChange={handleBuzzerActiveChange}
        />

        {/* Settings button */}
        <Box textAlign="center" mt={6}>
          <Button
            colorScheme="purple"
            onClick={onSettingsModalOpen}
            leftIcon={<span>⚙️</span>}
          >
            Settings
          </Button>
        </Box>
      </VStack>

      {/* Device selection modal */}
      <Modal isOpen={isDeviceModalOpen} onClose={onDeviceModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Connect {connectingDeviceType === "input" ? "Input" : "Output"} BLE
            Device
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <BLEDeviceScanner
              onDeviceSelected={(device) => {
                if (connectingDeviceType === "input") {
                  setInputDevice(device);
                } else if (connectingDeviceType === "output") {
                  setOutputDevice(device);
                }
                onDeviceModalClose();
              }}
              serviceUUIDs={
                connectingDeviceType === "input"
                  ? [ESP_SERVICE_UUID_INPUT]
                  : [ESP_SERVICE_UUID_OUTPUT]
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onDeviceModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* <Modal isOpen={isDeviceModalOpen} onClose={onDeviceModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Connect BLE Device</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <BLEDeviceScanner
              onDeviceSelected={(device) => {
                if (!inputDevice) {
                  setInputDevice(device);
                } else if (!outputDevice) {
                  setOutputDevice(device);
                }
                onDeviceModalClose();
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onDeviceModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal> */}

      {/* Settings modal */}
      <Modal isOpen={isSettingsModalOpen} onClose={onSettingsModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Heading as="h4" size="sm" mb={2}>
                  Sensor 1 Threshold
                </Heading>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sensor1Threshold}
                  onChange={(e) =>
                    setSensor1Threshold(parseInt(e.target.value))
                  }
                  style={{ width: "100%" }}
                />
                <Text>{sensor1Threshold} cm</Text>
              </Box>

              <Box>
                <Heading as="h4" size="sm" mb={2}>
                  Sensor 2 Threshold
                </Heading>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sensor2Threshold}
                  onChange={(e) =>
                    setSensor2Threshold(parseInt(e.target.value))
                  }
                  style={{ width: "100%" }}
                />
                <Text>{sensor2Threshold} cm</Text>
              </Box>

              <Box>
                <Heading as="h4" size="sm" mb={2}>
                  Buzzer Frequency
                </Heading>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={buzzerFrequency}
                  onChange={(e) =>
                    handleBuzzerFrequencyChange(parseInt(e.target.value))
                  }
                  style={{ width: "100%" }}
                />
                <Text>{buzzerFrequency} Hz</Text>
              </Box>

              <Box>
                <Heading as="h4" size="sm" mb={2}>
                  Buzzer Active
                </Heading>
                <Button
                  colorScheme={isBuzzerActive ? "green" : "red"}
                  onClick={() => handleBuzzerActiveChange(!isBuzzerActive)}
                >
                  {isBuzzerActive ? "Enabled" : "Disabled"}
                </Button>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onSettingsModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
}

export default App;
