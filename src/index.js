import React from 'react';
import { Platform, StatusBar, Animated, Dimensions } from 'react-native';
import { AppLoading, Asset, Font, Icon, Location, Permissions } from 'expo';
import AppContext from './AppContext';
import MapScreen from './screens/MapScreen';
import CompassScreen from './screens/CompassScreen';
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
    screenPosition: new Animated.Value(0),
    alertPosition: new Animated.Value(-60),
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

  handleSetDestination = destination => {
    this.setState({ destination });
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
      toValue: 20,
      duration: 300,
    }).start();
  };

  hideAlertAnimation = () => {
    Animated.timing(this.state.alertPosition, {
      toValue: -60,
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
    }, 3000);
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
        ...Icon.Ionicons.font,
        'space-mono': require('../assets/fonts/SpaceMono-Regular.ttf'),
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
      return (
        <AppContext.Provider value={this.state}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <ScreenContainer style={{ transform: [{ translateX: screenPosition }] }}>
            <Alert style={{top: alertPosition}}>⚠️ {alert}</Alert>
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
  height: 100%;
  padding-top: 20px;
  flex-wrap: wrap;
`

const Alert = styled(Animated.Text)`
  background: #fdb135;
  position: absolute;
  width: 50%;
  height: 40px;
  line-height: 40px;
  text-align: center;
  z-index: 1;
`;

