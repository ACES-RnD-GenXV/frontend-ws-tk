// src/hooks/useBLE.js

import { useState, useCallback, useEffect } from "react";

/**
 * Custom hook for BLE device management
 * @param {Object} options Configuration options
 * @param {string[]} options.services Array of service UUIDs to filter devices
 * @returns {Object} BLE control methods and state
 */
export const useBLE = ({ services = [] } = {}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [characteristics, setCharacteristics] = useState({});

  // Check if Bluetooth is available
  const isBluetoothAvailable = useCallback(() => {
    return navigator.bluetooth !== undefined;
  }, []);

  // Scan for devices
  const startScan = useCallback(async () => {
    setError(null);

    if (!isBluetoothAvailable()) {
      setError("Bluetooth is not available in this browser");
      return;
    }

    try {
      setIsScanning(true);

      // console.log(services);

      const requestOptions =
        services.length > 0
          ? { filters: [{ services }], optionalServices: services }
          : { acceptAllDevices: true };

      const device = await navigator.bluetooth.requestDevice(requestOptions);

      // Add to devices list if not already there
      setDevices((prevDevices) => {
        const exists = prevDevices.some((d) => d.id === device.id);
        return exists ? prevDevices : [...prevDevices, device];
      });

      setIsScanning(false);
      // console.log(services);

      return device;
    } catch (err) {
      setError(err.message);
      setIsScanning(false);
      return null;
    }
  }, [services, isBluetoothAvailable]);

  // Connect to device
  // In useBLE.js, update the connectToDevice function:
  const connectToDevice = useCallback(
    async (device) => {
      try {
        setError(null);
        const server = await device.gatt.connect();
        setConnectedDevice(device);

        const discoveredServices = {};
        for (const serviceId of services) {
          try {
            const service = await server.getPrimaryService(serviceId);
            const characteristics = await service.getCharacteristics();

            discoveredServices[serviceId] = {};
            for (const char of characteristics) {
              discoveredServices[serviceId][char.uuid] = char;
            }
          } catch (e) {
            console.error(`Service ${serviceId} not found:`, e);
          }
        }

        setCharacteristics(discoveredServices);
        return { device, services: discoveredServices };
      } catch (err) {
        setError(err.message);
        return null;
      }
    },
    [services]
  );
  // const connectToDevice = useCallback(
  //   async (device) => {
  //     try {
  //       console.log("Connecting to device:", device);
  //       setError(null);
  //       console.log("Before connect:", device.gatt.connected);
  //       const server = await device.gatt.connect();
  //       console.log("After connect:", device.gatt.connected);
  //       console.log("Device:", device);
  //       setConnectedDevice(device);
  //       console.log("Connected device:", connectedDevice);

  //       // Get all services
  //       const discoveredServices = {};
  //       for (const serviceId of services) {
  //         try {
  //           const service = await server.getPrimaryService(serviceId);
  //           const serviceCharacteristics = await service.getCharacteristics();

  //           discoveredServices[serviceId] = serviceCharacteristics.reduce(
  //             (acc, char) => {
  //               acc[char.uuid] = char;
  //               return acc;
  //             },
  //             {}
  //           );
  //         } catch (e) {
  //           console.log(
  //             `Service ${serviceId} not found on device. Error : ${e}`
  //           );
  //         }
  //       }

  //       setCharacteristics(discoveredServices);
  //       return { device, services: discoveredServices };
  //     } catch (err) {
  //       setError(err.message);
  //       return null;
  //     }
  //   },
  //   [services, connectedDevice]
  // );

  // Disconnect from device
  const disconnect = useCallback(async () => {
    if (connectedDevice && connectedDevice.gatt.connected) {
      await connectedDevice.gatt.disconnect();
      setConnectedDevice(null);
      setCharacteristics({});
    }
  }, [connectedDevice]);

  // Read characteristic value
  const readCharacteristic = useCallback(
    async (serviceId, characteristicId) => {
      try {
        const characteristic = characteristics[serviceId]?.[characteristicId];
        if (!characteristic) {
          throw new Error("Characteristic not found");
        }

        const value = await characteristic.readValue();
        return new DataView(value.buffer);
      } catch (err) {
        setError(err.message);
        return null;
      }
    },
    [characteristics]
  );

  // Write to characteristic
  const writeCharacteristic = useCallback(
    async (serviceId, characteristicId, data) => {
      try {
        const characteristic = characteristics[serviceId]?.[characteristicId];
        if (!characteristic) {
          throw new Error("Characteristic not found");
        }

        await characteristic.writeValue(data);
        return true;
      } catch (err) {
        setError(err.message);
        return false;
      }
    },
    [characteristics]
  );

  // Subscribe to notifications
  const startNotifications = useCallback(
    async (serviceId, characteristicId, listener) => {
      try {
        const characteristic = characteristics[serviceId]?.[characteristicId];
        if (!characteristic) {
          throw new Error("Characteristic not found");
        }

        await characteristic.startNotifications();
        characteristic.addEventListener("characteristicvaluechanged", listener);

        return () => {
          characteristic.removeEventListener(
            "characteristicvaluechanged",
            listener
          );
          characteristic.stopNotifications().catch(console.error);
        };
      } catch (err) {
        setError(err.message);
        return null;
      }
    },
    [characteristics]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (connectedDevice && connectedDevice.gatt.connected) {
        connectedDevice.gatt.disconnect();
      }
    };
  }, [connectedDevice]);

  return {
    isBluetoothAvailable,
    isScanning,
    devices,
    connectedDevice,
    error,
    startScan,
    connectToDevice,
    disconnect,
    readCharacteristic,
    writeCharacteristic,
    startNotifications,
  };
};
