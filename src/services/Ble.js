import { NativeModules, NativeEventEmitter } from 'react-native'
import BleManager from 'react-native-ble-manager'
import BackgroundTimer from 'react-native-background-timer'
import { stringToBytes, bytesToString } from 'convert-string'

export default class Ble {

  connect = async () => {
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
                  this.setState({
                    peripheralId: peripheral.id,
                    peripheralInfo: peripheralInfo
                  })
                  this.BleStartNotification()
                  this.BleListen()
                  await this.setState({confirmedConnection: false})
                  console.log('Attempting to confirm connection ...');
                  const interval = setInterval(() => {
                    if (this.state.confirmedConnection) {
                      this.setState({
                        bleConnected: true,
                        bleConnecting: false
                      })
                      this.sendData()
                      BackgroundTimer.runBackgroundTimer(() => { 
                        this.sendData()
                      }, 5000)
                      clearInterval(interval)
                    } else {
                      this.BleWrite("connect")
                    }
                  }, 1000);
                });
              })
            }
          })
        } else {
          console.log("Could not find crow prototype");
          this.setState({bleConnecting: false})
        }
      });
    }, 3000)
  }

  disconnect = async () => {
    BackgroundTimer.stopBackgroundTimer()
    await this.setState({
      initiateDisconnection: false,
      bleDisconnecting: true
    })
    const interval = setInterval(async () => {
      if (this.state.initiateDisconnection) {
        if (this.subscription) { await this.subscription.remove() }
        BleManager.disconnect(this.state.peripheralId)
        .catch((error) => {
          console.log(error);
        })
        this.setState({bleConnected: false})
        this.setState({bleDisconnecting: false})
        clearInterval(interval)
      } else {
        console.log('attempting to initiate disconnection ...');
        this.BleWrite("disconnect")
      }
    }, 1000);
  }

  startNotification = () => {
    const { peripheralInfo, peripheralId } = this.state
    const serviceUUID = peripheralInfo.characteristics[0].service
    const characteristicUUID = peripheralInfo.characteristics[0].characteristic
    BleManager.startNotification(peripheralId, serviceUUID, characteristicUUID)
    .catch((error) => {
      console.log(error);
    })
  }

  write = (data) => {
    const { peripheralInfo, peripheralId } = this.state
    const serviceUUID = peripheralInfo.characteristics[0].service
    const characteristicUUID = peripheralInfo.characteristics[0].characteristic
    const byteData = stringToBytes(`{${data}}`)
    BleManager.writeWithoutResponse(peripheralId, serviceUUID, characteristicUUID, byteData)
    .catch((e) => {
      console.log(e);
    })    
  }

  listen = () => {    
    const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);
    this.subscription = bleManagerEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      ({ value }) => {
        console.log('received:', bytesToString(value));        
        if (bytesToString(value).includes("confirmedConnection")) {
          this.setState({confirmedConnection: true})        
        } else if (bytesToString(value).includes("initDisconnection")) {
          this.setState({initiateDisconnection: true})
        }
      }
    );
  }
}

