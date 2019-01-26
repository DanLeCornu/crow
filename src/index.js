import React from 'react';
import { Platform, StatusBar, Animated, Dimensions } from 'react-native';
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
    distance: null,
    screenPosition: new Animated.Value(0),
    alertPosition: new Animated.Value(-40),
    setDestination: destination => this.handleSetDestination(destination),
    clearDestination: () => this.handleClearDestination(),
    setAlert: alert => this.handleSetAlert(alert),
    hideAlert: () => this.handleHideAlert(),
    setScreen: screen => this.handleSetScreen(screen),
  };

  componentDidMount() {
    this.requestPermissions();
    this.subscribeToLocation();
  }

  componentDidUpdate = prevProps => {
    if (this.state.destination) {
      if (prevProps.location != this.props.location) {
        this.setDistance();
      }
    }
  };

  handleSetDestination = async destination => {
    await this.setState({ destination });
    this.setDistance();
  };

  setDistance = async () => {
    let distanceM = await Geolib.getDistance(
      {
        latitude: this.state.location[0],
        longitude: this.state.location[1],
      },
      {
        latitude: this.state.destination[0],
        longitude: this.state.destination[1],
      },
    );
    let distance = (distanceM / 1000).toFixed(2);
    this.setState({ distance })
  };

  handleClearDestination = () => {
    this.setState({ destination: null });
  };

  handleHideAlert = () => {
    if (this.state.alert) {
      this.hideAlertAnimation();
      setTimeout(() => {
        this.setState({ alert: null });
      }, 300);
    }
  };

  handleSetAlert = alert => {
    if (!this.state.alert) {
      this.setState({ alert });
      this.showAlertAnimation()
      setTimeout(() => {
        this.handleHideAlert();
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

  handleSetScreen = screen => {
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
      ]),
      Font.loadAsync({
        'open-sans': require('../assets/fonts/OpenSans-Regular.ttf'),
        'open-sans-bold': require('../assets/fonts/OpenSans-Bold.ttf'),
      }),
    ]);
  };

  handleLoadingError = error => {
    Sentry.captureException(new Error(error));
  };

  handleFinishLoading = () => {
    this.setState({ loadingComplete: true });
  };

  render() {
    if (!this.state.loadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this.loadResourcesAsync}
          onError={this.handleLoadingError}
          onFinish={this.handleFinishLoading}
        />
      );
    } else {
      const { screenPosition, alert, alertPosition } = this.state;
      const screenHeight = Dimensions.get('window').height - 20
      return (
        <AppContext.Provider value={this.state}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <ScreenContainer style={{ transform: [{ translateX: screenPosition }], height: screenHeight }}>
            <AlertContainer style={{top: alertPosition}}>
              <Alert>{alert}</Alert>
            </AlertContainer>
            <MapScreen />
            {this.state.destination &&
              <CompassScreen />
            }
          </ScreenContainer>
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