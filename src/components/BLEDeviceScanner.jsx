import { Box, Button, Heading, Text, VStack, useToast } from "@chakra-ui/react";
import { useBLE } from "../hooks/useBLE";

const BLEDeviceScanner = ({ onDeviceSelected, serviceUUIDs = [] }) => {
  const toast = useToast();
  const { isBluetoothAvailable, startScan, isScanning, error } = useBLE({
    services: serviceUUIDs,
  });

  const handleScan = async () => {
    if (!isBluetoothAvailable()) {
      toast({
        title: "Bluetooth not available",
        description:
          "Your browser doesn't support Web Bluetooth or it's disabled.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const device = await startScan();
    if (device) {
      toast({
        title: "Device found",
        description: `Found device: ${device.name || "Unknown device"}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onDeviceSelected(device);
    }
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
        <Heading size="md">Connect to ESP32 Device</Heading>

        <Button
          colorScheme="blue"
          onClick={handleScan}
          isLoading={isScanning}
          loadingText="Scanning..."
          w="full"
        >
          Scan for ESP32 Devices
        </Button>

        {error && (
          <Text color="red.500">
            Error: User canceled scanning devices or method unsupported.
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default BLEDeviceScanner;
