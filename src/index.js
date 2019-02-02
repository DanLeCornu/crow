import React from 'react';
import { Platform, StatusBar, Animated, Easing, Dimensions, Linking, Image } from 'react-native';
import { AppLoading, Asset, Font, Location, Permissions } from 'expo';
import AppContext from './AppContext';
import MapScreen from './screens/MapScreen';
import CompassScreen from './screens/CompassScreen';
import { CustomText } from './components/CustomText'
import Geolib from 'geolib';
import Sentry from 'sentry-expo';
import { SENTRY_DSN } from '../Config';
Sentry.enableInExpoDevelopment = true;
Sentry.config(SENTRY_DSN).install();

import styled from 'styled-components';

export default class App extends React.Component {
  state = {
    alert: null,
    loadingComplete: false,
    location: null,
    destination: null,
    distance: 0,
    crowPosition: new Animated.Value(0),
    screenPosition: new Animated.Value(0),
    alertPosition: new Animated.Value(-40),
    setDestination: destination => this.setDestination(destination),
    clearDestination: () => this.clearDestination(),
    setAlert: alert => this.setAlert(alert),
    hideAlert: () => this.hideAlert(),
    setScreen: screen => this.setScreen(screen),
    finishRoute: () => this.finishRoute(),
  };

  componentDidMount() {
    this.bounceCrow();
    this.requestPermissions();
    this.subscribeToLocation();
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.destination) {
      if (prevState.location != this.state.location) {
        this.setDistance()
      }
    }
  };

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

  finishRoute = () => {
    this.setState({ destination: null })
    this.setScreen("Map")
  }

  hideAlert = () => {
    if (this.state.alert) {
      this.hideAlertAnimation();
      setTimeout(() => {
        this.setState({ alert: null });
      }, 300);
    }
  };

  setAlert = alert => {
    if (!this.state.alert) {
      this.setState({ alert });
      this.showAlertAnimation()
      setTimeout(() => {
        this.hideAlert();
      }, 2000);
    }
  };

  showAlertAnimation = () => {
    Animated.timing(this.state.alertPosition, {
      toValue: 0,
      duration: 300,
    }).start();
  };

  hideAlertAnimation = () => {
    Animated.timing(this.state.alertPosition, {
      toValue: -40,
      duration: 300,
    }).start();
  };

  setScreen = screen => {
    if (screen == "Compass") {this.compassScreenTransition()}
    if (screen == "Map") {this.mapScreenTransition()}
  };

  compassScreenTransition = () => {
    Animated.timing(this.state.screenPosition, {
      toValue: -Dimensions.get('window').width,
      duration: 300,
    }).start();
  };

  mapScreenTransition = () => {
    Animated.timing(this.state.screenPosition, {
      toValue: 0,
      duration: 300,
    }).start();
  };

  requestPermissions = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        alert: 'Location permissions denied',
      });
    }
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
        require('../assets/images/nq_logo.png'),
        require('../assets/images/crow_marker.png'),
      ]),
      Font.loadAsync({
        'open-sans': require('../assets/fonts/OpenSans-Regular.ttf'),
      }),
    ]);
  };

  loadingError = error => {
    Sentry.captureException(new Error(error));
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
      const { location, crowPosition, screenPosition, alert, alertPosition } = this.state;
      const screenHeight = Dimensions.get('window').height - 20
      return (
        <AppContext.Provider value={this.state}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          {!location ? (
            <LoadingContainer>
              <Crow
                style={{ transform: [{ translateY: crowPosition }] }}
                source={require('../assets/images/crow.png')}
              />
              <LoadingText>fetching your location ...</LoadingText>
                <NQ onPress={() => Linking.openURL('https://www.noquarter.co')}>
                  built by <NQLogo source={require('../assets/images/nq_logo.png')} /> (v0.1.1)
                </NQ>
            </LoadingContainer>
          ) : (
            <ScreenContainer style={{ transform: [{ translateX: screenPosition }], height: screenHeight }}>
              <AlertContainer style={{top: alertPosition}}>
                <Alert>{alert}</Alert>
              </AlertContainer>
              <MapScreen />
              {this.state.destination &&
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
  width: 200%;
  flex-wrap: wrap;
  margin-top: 20px;
  overflow: hidden;
`
const AlertContainer = styled(Animated.View)`
  position: absolute;
  background: #fdb135;
  width: 47%;
  margin: 0 1% 0 1%;
  height: 40px;
  z-index: 1;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  shadow-color: #000;
  shadow-opacity: 0.1;
`
const Alert = styled(CustomText)`
  line-height: 40px;
  text-align: center;
  font-size: 16px;
`
const LoadingContainer = styled.View`
  width: 100%;
  height: 100%;
  flex-direction: row
  justify-content: center;;
  align-items: center;
`
const LoadingText = styled(CustomText)`
  font-size: 20px;
`
const Crow = styled(Animated.Image)`
  width: 50px;
  height: 50px;
  margin-right: 10px;
  resize-mode: contain;
`
const NQ = styled(CustomText)`
  position: absolute;
  bottom: 20px;
  width: 100%;
  text-align: center;
  line-height: 25px;
  font-size: 20px;
`
const NQLogo = styled(Image)`
  width: 25px;
  height: 25px;
  border-radius: 4px;
`