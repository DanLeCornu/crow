import { NativeModules, NativeEventEmitter } from 'react-native'
import BleManager from 'react-native-ble-manager'
import BackgroundTimer from 'react-native-background-timer'
import { stringToBytes, bytesToString } from 'convert-string'

export default class Ble {
  confirmedConnection = false
  initiateDisconnection = false

  connect = async (handleSetPeripheral, handleConfirmedConnection, sendData, confirmConnection, handleConnectionFailure) => {
    await BleManager.start({showAlert: false})
    await BleManager.scan([], 3, true).then(() => {
      console.log("Scan started ...");
    });
    setTimeout(() => {
      BleManager.getDiscoveredPeripherals([]).then((peripheralsArray) => {
        if (peripheralsArray.length > 1) {
          peripheralsArray.forEach((peripheral) => {
            if (peripheral.name === "DSDTECH HM-10") {
              BleManager.connect(peripheral.id).then(() => {
                BleManager.retrieveServices(peripheral.id).then(async (peripheralInfo) => {
                  handleSetPeripheral(peripheral.id, peripheralInfo)
                  this.startNotification(peripheral.id, peripheralInfo)
                  this.listen()
                  this.confirmedConnection = false
                  console.log('Attempting to confirm connection ...');
                  const interval = setInterval(() => {
                    if (this.confirmedConnection) {
                      handleConfirmedConnection()
                      sendData()
                      BackgroundTimer.runBackgroundTimer(() => { 
                        sendData()
                      }, 3000)
                      clearInterval(interval)
                    } else {
                      confirmConnection()
                    }
                  }, 1000);
                });
              })
            }
          })
        } else {
          console.log("Could not find crow prototype");
          handleConnectionFailure()
        }
      });
    }, 3000)
  }

  startNotification = (peripheralId, peripheralInfo) => {
    const serviceUUID = peripheralInfo.characteristics[0].service
    const characteristicUUID = peripheralInfo.characteristics[0].characteristic
    BleManager.startNotification(peripheralId, serviceUUID, characteristicUUID)
    .catch((error) => {
      console.log(error);
    })
  }

  listen = () => {    
    const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);
    this.subscription = bleManagerEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      ({ value }) => {
        console.log('received:', bytesToString(value))
        if (bytesToString(value).includes("confirmedConnection")) {
          this.confirmedConnection = true
        } else if (bytesToString(value).includes("initDisconnection")) {
          this.initiateDisconnection = true
        }
      }
    );
  }

  write = (peripheralId, peripheralInfo, data) => {
    const serviceUUID = peripheralInfo.characteristics[0].service
    const characteristicUUID = peripheralInfo.characteristics[0].characteristic
    const byteData = stringToBytes(`{${data}}`)
    BleManager.writeWithoutResponse(peripheralId, serviceUUID, characteristicUUID, byteData)
    .catch((e) => {
      console.log(e);
    })    
  }

  disconnect = async (handleSetBleDisconnecting, handleInitiateDisconnection, peripheralId, handleConfirmedDisconnection) => {
    BackgroundTimer.stopBackgroundTimer()
    this.initiateDisconnection = false
    await handleSetBleDisconnecting()
    const interval = setInterval(async () => {
      if (this.initiateDisconnection) {
        if (this.subscription) { await this.subscription.remove() }
        BleManager.disconnect(peripheralId)
        .catch((error) => {
          console.log(error);
        })
        handleConfirmedDisconnection()
        clearInterval(interval)
      } else {
        console.log('attempting to initiate disconnection ...');
        handleInitiateDisconnection()
      }
    }, 1000);
  }
}

