import React from 'react'
import { Platform, Animated, Dimensions, NativeModules, AsyncStorage, StatusBar } from 'react-native'

import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import * as Font from 'expo-font';
import * as TaskManager from 'expo-task-manager';

import AppContext from './AppContext'
import LoadingScreen from './screens/LoadingScreen'
import IntroScreen from './screens/IntroScreen'
import MapScreen from './screens/MapScreen'
import CompassScreen from './screens/CompassScreen'
import Geolib from 'geolib'
import Ble from './services/Ble'

import styled from 'styled-components';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.log(error.message);
  }
  if (data) {
    const { locations } = data
    const location = [locations[0].coords.latitude, locations[0].coords.longitude];
    console.log(location);
  }
});


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

  ble = new Ble()
  
  componentDidMount() {  
    this.setScreenHeight()
    this.requestPermissions()
    // this.subscribeToLocation()
    setTimeout(() => {
      this.subscribeToBackgroundLocation()
      this.moveTo('right');
    }, 3000);
    this.setSkipIntro()
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.destination && prevState.location != this.state.location) {
      this.setDistance()
    }
  };

  subscribeToBackgroundLocation = async () => {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
    });
  }

  bleConnect = () => {
    this.setState({
      bleConnecting: true,
      confirmedConnection: false
    })
    this.ble.connect()
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