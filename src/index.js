import React from 'react';
import { Animated, Dimensions, NativeModules } from 'react-native';
import { AppLoading, Asset, Font, Location, Permissions } from 'expo';
import AppContext from './AppContext';
import LoadingScreen from './screens/LoadingScreen';
import IntroScreen from './screens/IntroScreen';
import MapScreen from './screens/MapScreen';
import CompassScreen from './screens/CompassScreen';
import Geolib from 'geolib';

import styled from 'styled-components';

export default class App extends React.Component {
  state = {
    theme: '#FFE853',
    screenHeight: 0,
    loadingComplete: false,
    location: null,
    destination: null,
    distance: 0,
    screenXPosition: new Animated.Value(0),
    setDestination: destination => this.setDestination(destination),
    clearDestination: () => this.clearDestination(),
    moveTo: direction => this.moveTo(direction),
  };

  componentDidMount() {
    this.setScreenHeight()
    this.requestPermissions()
    this.subscribeToLocation()
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.destination) {
      if (prevState.location != this.state.location) {
        this.setDistance()
      }
    }
  };

  setScreenHeight = () => {
    NativeModules.StatusBarManager.getHeight((statusBarManager) => {
      const screenHeight = Dimensions.get('window').height - statusBarManager.height
      this.setState({screenHeight})
    })
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
        require('../assets/images/compass.png'),
        require('../assets/images/arrow.png'),
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
      const { screenHeight, location, screenXPosition, destination } = this.state;
      return (
        <AppContext.Provider value={this.state}>
          <ScreenContainer style={{ transform: [{ translateX: screenXPosition }], height: screenHeight }}>
            <LoadingScreen />
            <IntroScreen />
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