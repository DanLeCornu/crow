import React from 'react'
import { Platform, Animated, Dimensions, NativeModules, AsyncStorage, StatusBar, NativeEventEmitter } from 'react-native'
import { AppLoading, Asset, Font, Location, Permissions } from 'expo'
import AppContext from './AppContext'
import LoadingScreen from './screens/LoadingScreen'
import IntroScreen from './screens/IntroScreen'
import MapScreen from './screens/MapScreen'
import CompassScreen from './screens/CompassScreen'
import Geolib from 'geolib'
import BleManager from 'react-native-ble-manager'
import { stringToBytes, bytesToString } from 'convert-string'
import BackgroundTimer from 'react-native-background-timer'

import styled from 'styled-components';

export default class App extends React.Component {
  state = {
    theme: '#FFE853',
    screenHeight: 0,
    loadingComplete: false,
    skipIntro: false,
    location: null,
    destination: null,
    totalTripDistance: 0,
    distance: 0,
    bleConnected: false,
    bleConnecting: false,
    bleDisconnecting: false,
    peripheralId: null,
    peripheralInfo: null,
    confirmedConnection: false,
    initiateDisconnection: false,
    screenXPosition: new Animated.Value(0),
    setRoute: d => this.setRoute(d),
    moveTo: d => this.moveTo(d),
    storeData: (k,v) => this.storeData(k,v),
    BleConnect: () => this.BleConnect(),
    BleDisconnect: () => this.BleDisconnect(),
  };
  
  componentDidMount() {
    this.setScreenHeight()
    this.requestPermissions()
    this.subscribeToLocation()
    this.setSkipIntro()
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.destination && prevState.location != this.state.location) {
      this.setDistance()
    }
  };

  BleConnect = async () => {
    this.setState({
      bleConnecting: true,
      confirmedConnection: false
    })
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
                      BackgroundTimer.runBackgroundTimer(() => { 
                        this.sendData()
                      }, 3000)
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

  BleDisconnect = async () => {
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

  BleStartNotification = () => {
    const { peripheralInfo, peripheralId } = this.state
    const serviceUUID = peripheralInfo.characteristics[0].service
    const characteristicUUID = peripheralInfo.characteristics[0].characteristic
    BleManager.startNotification(peripheralId, serviceUUID, characteristicUUID)
    .catch((error) => {
      console.log(error);
    })
  }

  BleWrite = (data) => {
    const { peripheralInfo, peripheralId } = this.state
    const serviceUUID = peripheralInfo.characteristics[0].service
    const characteristicUUID = peripheralInfo.characteristics[0].characteristic
    const byteData = stringToBytes(`${data}`)
    BleManager.writeWithoutResponse(peripheralId, serviceUUID, characteristicUUID, byteData)
    .catch((e) => {
      console.log(e);
    })    
  }

  BleListen = () => {    
    const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);
    this.subscription = bleManagerEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      ({ value }) => {
        console.log('received:', bytesToString(value));        
        if (bytesToString(value).includes("confirmedConnection")) {
          this.setState({confirmedConnection: true})
          console.log('CONFIRMED CONNECTION');          
        } else if (bytesToString(value).includes("initDisconnection")) {
          this.setState({initiateDisconnection: true})
          console.log('CONFIRMED DISCONNECTION');
        }
      }
    );
  }

  sendData() {
    const data = `${this.state.location.map((e) => {return e.toFixed(4)})},${this.state.destination.map((e) => {return e.toFixed(4)})},${this.state.distance},${this.state.totalTripDistance}`
    this.BleWrite(data)
  }

  setSkipIntro = async () => {
    const skipIntro = await this.retrieveData('skipIntro')
    this.setState({skipIntro})
  }

  setScreenHeight = () => {
    if (Platform.OS === 'ios') {
      NativeModules.StatusBarManager.getHeight((statusBarManager) => {
        const screenHeight = Dimensions.get('window').height - statusBarManager.height
        this.setState({screenHeight})
      })
    } else {
      const screenHeight = Dimensions.get('window').height
      this.setState({screenHeight})
    }
  }

  setRoute = async destination => {
    await this.setState({ destination });
    await this.setDistance()
    await this.setTotalTripDistance()
    if (this.state.bleConnected) {
      this.sendData()
    }
  };

  setTotalTripDistance = async () => {
    const totalTripDistance = await this.calcDistance(this.state.location, this.state.destination)
    this.setState({ totalTripDistance })
  }

  setDistance = async () => {
    const distance = await this.calcDistance(this.state.location, this.state.destination)
    this.setState({ distance })
  }

  calcDistance = (start, finish) => {
    let distanceM = Geolib.getDistance(
      {
        latitude: start[0],
        longitude: start[1],
      },
      {
        latitude: finish[0],
        longitude: finish[1],
      },
    )
    return (distanceM / 1000).toFixed(2);
  }

  moveTo = direction => {
    const currentPosition = this.state.screenXPosition._value
    const screenWidth = Dimensions.get('window').width  
    if (direction === 'right') {
      Animated.timing(this.state.screenXPosition, {
        toValue: currentPosition - screenWidth,
        duration: 300,
      }).start();
    } else if (direction === 'left') {
      Animated.timing(this.state.screenXPosition, {
        toValue: currentPosition + screenWidth,
        duration: 300,
      }).start();
    }
  }

  requestPermissions = () => {
    Permissions.askAsync(Permissions.LOCATION);
  };

  subscribeToLocation = async () => {
    setTimeout(() => {
      Location.watchPositionAsync(
        {
          enableHighAccuracy: true,
          distanceInterval: 5,
        },
        async data => {
          const location = [data.coords.latitude, data.coords.longitude];
          await this.setState({ location });
        },
      );
      this.moveTo('right');
    }, 3000);
  };

  loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('../assets/images/crow.png'),
        require('../assets/images/privacy_button.png'),
        require('../assets/images/navigate_arrow.png'),
        require('../assets/images/map.png'),
        require('../assets/images/compass_ring.png'),
        require('../assets/images/compass_arrow.png'),
        require('../assets/images/directions_white.png'),
        require('../assets/images/directions_black.png'),
      ]),
      Font.loadAsync({
        'galano-grotesque': require('../assets/fonts/GalanoGrotesque-Bold.ttf'),
      }),
    ]);
  };

  loadingError = error => {
    console.log(error);
  };

  finishLoading = () => {
    this.setState({ loadingComplete: true });
  };

  storeData = async (k,v) => {
    try {
      await AsyncStorage.setItem(k,v)
    } catch (e) {
      console.log(e.message);
    }
  }

  retrieveData = async (k) => {
    try {
      const value = await AsyncStorage.getItem(k)
      if (value !== null) {
        return value
      }
    } catch (e) {
      console.log(e.message);
    }
  }

  render() {
    if (!this.state.loadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this.loadResourcesAsync}
          onError={this.loadingError}
          onFinish={this.finishLoading}
        />
      );
    } else {
      const { screenHeight, location, screenXPosition, destination, skipIntro } = this.state;
      return (
        <AppContext.Provider value={this.state}>
          <StatusBar barStyle="default"/>
          <ScreenContainer style={{ transform: [{ translateX: screenXPosition }], height: screenHeight }}>
            <LoadingScreen />
            {skipIntro !== 'true' &&
              <IntroScreen />
            }
            {location && 
              <MapScreen />
            }
            {location && destination && 
              <CompassScreen />
            }
          </ScreenContainer>
        </AppContext.Provider>
      );
    }
  }
}

const ScreenContainer = styled(Animated.View)`
  width: 500%;
  flex-wrap: wrap;
  height: ${props => `${props.height}px`};
  overflow: hidden;
  position: absolute;
  bottom: 0;
`