import React from 'react';
import { Platform, Animated, Dimensions, NativeModules, AsyncStorage, StatusBar } from 'react-native';
import { AppLoading, Asset, Font, Location, Permissions } from 'expo';
import AppContext from './AppContext';
import LoadingScreen from './screens/LoadingScreen';
import IntroScreen from './screens/IntroScreen';
import MapScreen from './screens/MapScreen';
import CompassScreen from './screens/CompassScreen';
import Geolib from 'geolib';
import BleManager from 'react-native-ble-manager'

import styled from 'styled-components';

export default class App extends React.Component {
  state = {
    theme: '#FFE853',
    screenHeight: 0,
    loadingComplete: false,
    skipIntro: false,
    location: null,
    destination: null,
    distance: 0,
    screenXPosition: new Animated.Value(0),
    setDestination: destination => this.setDestination(destination),
    clearDestination: () => this.clearDestination(),
    moveTo: direction => this.moveTo(direction),
    storeData: (k,v) => this.storeData(k,v),
    // connectBLE: () => this.connectBLE()
  };

  // manager = new BleManager({
  //   restoreStateIdentifier: "restoreStateIdentifier",
  //   restoreStateFunction: () => { console.log('restoreStateFunction') }
  // });
  
  componentDidMount() {
    this.setScreenHeight()
    this.requestPermissions()
    this.subscribeToLocation()
    this.setSkipIntro()

    BleManager.start({showAlert: false})
    .then(() => {
      // Success code
      console.log('Module initialized');
    });
    BleManager.scan([], 5, true)
    .then((results) => {
      // Success code
      console.log('Scan started');
      console.log(results)
    });
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.destination) {
      if (prevState.location != this.state.location) {
        this.setDistance()
      }
    }
  };

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

  setDestination = async destination => {
    await this.setState({ destination });
    this.setDistance()
  };

  clearDestination = () => {
    this.setState({ destination: null })
  }

  setDistance = () => {
    let distanceM = Geolib.getDistance(
      {
        latitude: this.state.location[0],
        longitude: this.state.location[1],
      },
      {
        latitude: this.state.destination[0],
        longitude: this.state.destination[1],
      },
    )
    let distance = (distanceM / 1000).toFixed(1);
    this.setState({ distance })
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
        data => {
          const location = [data.coords.latitude, data.coords.longitude];
          this.setState({ location });
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

  // connectBLE = () => {
  //   console.log('connect ble');
  //   const subscription = this.manager.onStateChange((state) => {
  //     if (state === 'PoweredOn') {
  //         this.scanAndConnect();
  //         subscription.remove();
  //     }
  //   }, true);
  // }

  // scanAndConnect() {
  //   this.manager.startDeviceScan(null, null, (error, device) => {
  //     console.log("Scanning...");
  //     console.log(device.name);
  //     if (error) {
  //       // Handle error (scanning will be stopped automatically)
  //       console.log(error.message);
  //       return
  //     }
  //     // Check if it is a device you are looking for based on advertisement data
  //     // or other criteria.
  //     if (device.name === 'DSDTECH HM-10') {
  //       console.log("Connecting to DSD HM-10")
  //       // Stop scanning as it's not necessary if you are scanning for one device.
  //       this.manager.stopDeviceScan();
  //       // Proceed with connection.
  //       device.connect()
  //         .then((device) => {
  //           console.log("Discovering services and characteristics")
  //           return device.discoverAllServicesAndCharacteristics()
  //         })
  //         .then((device) => {
  //           console.log("Setting notifications")
  //           return this.setupNotifications(device)
  //         })
  //         .then(() => {
  //           console.log("Listening...")
  //         }, (error) => {
  //           console.log(error.message)
  //         })
  //     }
  //   });
  // }

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