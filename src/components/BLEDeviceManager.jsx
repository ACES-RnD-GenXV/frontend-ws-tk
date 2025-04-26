import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Badge,
  HStack,
  Icon,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useBLE } from "../hooks/useBLE";

const BLEDeviceManager = ({
  device,
  serviceUUIDs = [],
  onConnected,
  onDisconnected,
  onServicesDiscovered,
}) => {
  const toast = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const { connectToDevice, disconnect, connectedDevice, error } = useBLE({
    services: serviceUUIDs,
  });

  useEffect(() => {
    // console.log("Connected to device:", connectedDevice);

    if (connectedDevice) {
      onConnected(connectedDevice);
    } else {
      // console.log("Disconnected dari dalam from device.");
      onDisconnected && onDisconnected();
    }
  }, [connectedDevice, onConnected, onDisconnected]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await connectToDevice(device);
      if (result) {
        // console.log("Connected to device:", device);

        // Pass discovered services back to parent component
        if (result.services && onServicesDiscovered) {
          // console.log("Services discovered:", result.services);
          onServicesDiscovered(result.services);
        }

        toast({
          title: "Connected",
          description: `Connected to ${device.name || "device"}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: "Connection failed",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    toast({
      title: "Disconnected",
      description: `Disconnected from ${device.name || "device"}`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
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
      <VStack spacing={4} align="flex-start">
        <HStack justifyContent="space-between" width="100%">
          <Heading size="md">{device.name || "Unknown Device"}</Heading>
          <Badge colorScheme={connectedDevice ? "green" : "gray"}>
            {connectedDevice ? "Connected" : "Disconnected"}
          </Badge>
        </HStack>

        <Text>Device ID: {device.id}</Text>

        {connectedDevice ? (
          <Button colorScheme="red" onClick={handleDisconnect} w="full">
            Disconnect
          </Button>
        ) : (
          <Button
            colorScheme="blue"
            onClick={handleConnect}
            isLoading={isConnecting}
            loadingText="Connecting..."
            w="full"
          >
            Connect
          </Button>
        )}

        {error && <Text color="red.500">Error: {error}</Text>}
      </VStack>
    </Box>
  );
};

export default BLEDeviceManager;
