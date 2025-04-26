import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";

const DeviceDetailsCard = ({ device, serviceData = {} }) => {
  if (!device) return null;

  // console.log("Device:", device);
  // console.log("Device GATT Connected:", device.gatt.connected);

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
        <Heading size="md">Device Details</Heading>

        <HStack>
          <Text fontWeight="bold">Name:</Text>
          <Text>{device.name || "Unnamed Device"}</Text>
        </HStack>

        <HStack>
          <Text fontWeight="bold">Status:</Text>
          <Badge colorScheme={device.gatt.connected ? "green" : "red"}>
            {device.gatt.connected ? "Connected" : "Disconnected"}
          </Badge>
        </HStack>

        <Divider />

        <Heading size="sm">Services</Heading>

        {Object.keys(serviceData).length > 0 ? (
          <Accordion allowToggle width="100%">
            {Object.entries(serviceData).map(([serviceId, characteristics]) => (
              <AccordionItem key={serviceId}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    Service: {serviceId}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack align="flex-start">
                    <Text fontWeight="bold">Characteristics:</Text>
                    {Object.keys(characteristics).map((charId) => (
                      <Text key={charId} pl={4}>
                        {charId}
                      </Text>
                    ))}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Text>No service data available</Text>
        )}
      </VStack>
    </Box>
  );
};

export default DeviceDetailsCard;
