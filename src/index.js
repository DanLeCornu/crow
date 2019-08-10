import React from 'react'
import { Platform, Animated, Dimensions, NativeModules, StatusBar, AppState, Alert, Linking } from 'react-native'

import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import * as Font from 'expo-font';

import AppContext from './AppContext'
import LoadingScreen from './screens/LoadingScreen'
import IntroScreen from './screens/IntroScreen'
import MapScreen from './screens/MapScreen'
import CompassScreen from './screens/CompassScreen'
import Ble from './services/Ble'
import { calcDistance } from './services/calcDistance'
import { retrieveData, storeData } from './services/localStorage'
import { defineBackgroundTask } from './services/backgroundLocationTask'

import styled from 'styled-components';

import { WAIT, GRANTED, DENIED, GRANTED_IN_USE, BACKGROUND_LOCATION_TASK, } from './lib/constants'

defineBackgroundTask()

export default class App extends React.Component {
  state = {
    theme: '#FFE853',
    screenHeight: 0,
    loadingComplete: false,
    permissionStatus: WAIT,
    permissionAlert: false,
    subscribedToForegroundLocation: false,
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
    screenXPosition: new Animated.Value(0),
    setRoute: d => this.setRoute(d),
    moveTo: d => this.moveTo(d),
    connect: () => this.connect(),
    disconnect: () => this.disconnect(),
    askLocationPermission: () => this.askLocationPermission(),
    subscribeToForegroundLocation: () => this.subscribeToForegroundLocation(),
    setPermissionAlert: (status) => this.setPermissionAlert(status),
    setSkipIntro: () => this.setSkipIntro(),
  };

  ble = new Ble()
  
  componentDidMount() {
    this.setScreenHeight()
    this.askLocationPermission()
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.destination && (prevState.location != this.state.location)) {
      this.setDistance()
    }
  };

  setPermissionAlert = (status) => {
    this.setState({ permissionAlert: status })
  }

  askLocationPermission = async () => {
    const { status, permissions } = await Permissions.askAsync(Permissions.LOCATION)
    switch (status) {
      case 'granted':
        if (Platform.OS === 'ios') {
          const { scope } = permissions.location.ios

          this.setState({
            permissionStatus: scope === 'always' ? GRANTED : GRANTED_IN_USE,
          })
        } else {
          this.setState({ permissionStatus: GRANTED })
        }
        break
      case 'denied':
      default:
        this.setState({ permissionStatus: DENIED })
        break
    }
  }

  subscribeToForegroundLocation = async () => {
    this.foregroundSubscription = await Location.watchPositionAsync(
      {
        enableHighAccuracy: true,
        distanceInterval: 0,
        timeInterval: 1000,
      },
      async data => {
        const location = [data.coords.latitude, data.coords.longitude];
        await this.setState({ location });
      },
    );
    this.setState({ subscribedToForegroundLocation: true })
  };

  subscribeToBackgroundLocation = () => {
    Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 5,
    });
  }

  unsubscribeToBackgroundLocation = () => {
    Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
  }

  connect = async () => {
    await this.askLocationPermission()
    if (this.state.permissionStatus == GRANTED) {
      this.subscribeToBackgroundLocation()
      if (this.foregroundSubscription) {this.foregroundSubscription.remove()}
      this.setState({ bleConnecting: true })
      this.ble.connect(
        this.handleSetPeripheral,
        this.handleConfirmedConnection,
        this.sendData,
        this.confirmConnection,
        this.handleConnectionFailure
      )
    } else {
      Alert.alert(
        'Extra Location Permissions',
        'Hey! We need your permission to access your location in the background, in order for the Crow bike mount to work. Please go to your app settings and select "Always" for location :)',
        [
          { text: 'OK, will do!', onPress: () => {Linking.openURL('app-settings:')} },
        ],
        { cancelable: false }
      )
    }
  }

  handleSetPeripheral = (peripheralId, peripheralInfo) => {
    this.setState({ peripheralId, peripheralInfo })
  }

  handleConfirmedConnection = () => {
    this.setState({
      bleConnected: true,
      bleConnecting: false
    })
  }

  sendData = async () => {
    let location, distance
    if (AppState.currentState == "background") {
      console.log('sending background location');
      const locationLat = await retrieveData('locationLat')
      const locationLon = await retrieveData('locationLon')
      location = [parseFloat(locationLat), parseFloat(locationLon)]
      distance = await retrieveData('distance')
    } else {
      console.log('sending foreground location');
      location = this.state.location
      distance = this.state.distance
    }
    const data = `${location.map((c) => {return c.toFixed(4)})},${this.state.destination.map((c) => {return c.toFixed(4)})},${distance},${this.state.totalTripDistance}`
    const peripheralId = this.state.peripheralId
    const peripheralInfo = this.state.peripheralInfo
    this.ble.write(peripheralId, peripheralInfo, data)
  }

  confirmConnection = () => {
    const peripheralId = this.state.peripheralId
    const peripheralInfo = this.state.peripheralInfo
    this.ble.write(peripheralId, peripheralInfo, "connect")
  }

  handleConnectionFailure = () => {
    this.setState({bleConnecting: false})
  }

  disconnect = () => {
    this.ble.disconnect(
      this.handleSetBleDisconnecting,
      this.handleInitiateDisconnection,
      this.state.peripheralId,
      this.handleConfirmedDisconnection,
      this.handleUnconfirmedDisconnection
    )
    this.unsubscribeToBackgroundLocation()
    this.subscribeToForegroundLocation()
  }

  handleSetBleDisconnecting = () => {
    this.setState({ bleDisconnecting: true })
  }

  handleInitiateDisconnection = () => {
    const peripheralId = this.state.peripheralId
    const peripheralInfo = this.state.peripheralInfo
    this.ble.write(peripheralId, peripheralInfo, "disconnect")
  }

  handleConfirmedDisconnection = () => {
    this.setState({ bleConnected: false })
    this.setState({ bleDisconnecting: false })
  }

  handleUnconfirmedDisconnection = () => {
    this.setState({ bleConnected: false })
    this.setState({ bleDisconnecting: false })
  }

  setSkipIntro = async () => {
    const skipIntro = await retrieveData('skipIntro')
    this.setState({ skipIntro })
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
    await this.setState({ destination })
    await storeData('destinationLat', destination[0])
    await storeData('destinationLon', destination[1])
    await this.setDistance()
    await this.setTotalTripDistance()
    if (this.state.bleConnected) {
      this.sendData()
    }
  };
  
  setDistance = async () => {
    const distance = await calcDistance(this.state.location, this.state.destination)
    this.setState({ distance })
  }

  setTotalTripDistance = async () => {
    const totalTripDistance = await calcDistance(this.state.location, this.state.destination)
    this.setState({ totalTripDistance })
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