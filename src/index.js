import React from 'react';
import { Platform, StatusBar, Animated, Dimensions } from 'react-native';
import { AppLoading, Asset, Font, Icon, Location, Permissions } from 'expo';
import styled from 'styled-components';
import AppContext from './AppContext';
import MapScreen from './screens/MapScreen';
import CompassScreen from './screens/CompassScreen';
import Sentry from 'sentry-expo';
import { SENTRY_DSN } from '../Config';
Sentry.enableInExpoDevelopment = true;
Sentry.config(SENTRY_DSN).install();

export default class App extends React.Component {
  state = {
    alert: null,
    loadingComplete: false,
    location: null,
    destination: null,
    screenPosition: new Animated.Value(0),
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
    this.setState({ alert: null });
  };

  handleSetAlert = alert => {
    this.setState({ alert });
  };

  handleSetScreen = screen => {
    if (screen == "Compass") {this.startCompassScreenTransition()}
    if (screen == "Map") {this.startMapScreenTransition()}
  };

  startCompassScreenTransition = () => {
    Animated.timing(this.state.screenPosition, {
      toValue: -Dimensions.get('window').width,
      duration: 300,
    }).start();
  };

  startMapScreenTransition = () => {
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
      const { screenPosition } = this.state;      
      return (
        <AppContext.Provider value={this.state}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <ScreenContainer style={{ transform: [{ translateX: screenPosition }] }}>
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
  flex-wrap: wrap;
`

