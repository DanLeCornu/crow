import React from 'react';
import { Platform, StatusBar, Animated, Easing, Dimensions, NativeModules } from 'react-native';
import { AppLoading, Asset, Font, Location, Permissions } from 'expo';
import AppContext from './AppContext';
import MapScreen from './screens/MapScreen';
import CompassScreen from './screens/CompassScreen';
import IntroScreen from './screens/IntroScreen';
import { CustomText } from './components/CustomText'
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
    crowPosition: new Animated.Value(0),
    screenXPosition: new Animated.Value(0),
    setDestination: destination => this.setDestination(destination),
    clearDestination: () => this.clearDestination(),
    moveTo: direction => this.moveTo(direction),
  };

  componentDidMount() {
    this.setScreenHeight()
    this.bounceCrow()
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

  bounceCrow = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.state.crowPosition, {
          toValue: -20,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(this.state.crowPosition, {
          toValue: 0,
          duration: 700,
          easing: Easing.bounce,
        }),
      ]),
    ).start();
  };

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
    let distance = (distanceM / 1000).toFixed(2);
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
    }, 2000);
  };

  loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('../assets/images/crow.png'),
        require('../assets/images/compass.png'),
        require('../assets/images/arrow.png'),
        require('../assets/images/privacyButton.png'),
        require('../assets/images/navigateArrow.png'),
        require('../assets/images/map.png'),
        require('../assets/images/compassRing.png'),
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
      const { theme, screenHeight, location, crowPosition, screenXPosition, destination } = this.state;
      return (
        <AppContext.Provider value={this.state}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          {!location ? (
            <LoadingContainer background={theme}>
              <Crow
                style={{ transform: [{ translateY: crowPosition }] }}
                source={require('../assets/images/crow.png')}
              />
              <LoadingText>as the CROW flies</LoadingText>
            </LoadingContainer>
          ) : (
            <ScreenContainer style={{ transform: [{ translateX: screenXPosition }], height: screenHeight }}>
              <IntroScreen />
              <MapScreen />
              {destination &&
                <CompassScreen />
              }
            </ScreenContainer>
          )}
        </AppContext.Provider>
      );
    }
  }
}

const ScreenContainer = styled(Animated.View)`
  width: 400%;
  flex-wrap: wrap;
  height: ${props => `${props.height}px`};
  overflow: hidden;
  position: absolute;
  bottom: 0;
`
const LoadingContainer = styled.View`
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${props => props.background};
`
const LoadingText = styled(CustomText)`
  font-size: 20px;
`
const Crow = styled(Animated.Image)`
  width: 150px;
  height: 150px;
  resize-mode: contain;
`