import React from 'react';
import { Platform, StatusBar, View } from 'react-native';
import { AppLoading, Asset, Font, Icon, Location, Permissions } from 'expo';
import styled from 'styled-components';
import AppContext from './AppContext';
import MapScreen from './screens/MapScreen';
import CompassScreen from './screens/CompassScreen';
import Sentry from 'sentry-expo';
Sentry.enableInExpoDevelopment = true;
Sentry.config(
  'https://37e2a759270c432eafd92cd434a71e93@sentry.io/1374074',
).install();

export default class App extends React.Component {
  state = {
    screen: 'Map',
    alert: null,
    loadingComplete: false,
    location: null,
    destination: null,
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
    this.setState({ screen });
  };

  requestPermissions = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        alert: 'Location premissions denied',
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

  renderScreen = () => {
    switch (this.state.screen) {
      case 'Map':
        return <MapScreen />;
      case 'Compass':
        return <CompassScreen />;
      default:
        return <MapScreen />;
    }
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
      return (
        <AppContext.Provider value={this.state}>
          <Container>
            {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
            {this.renderScreen()}
          </Container>
        </AppContext.Provider>
      );
    }
  }
}

const Container = styled(View)`
  flex: 1;
  background: #fff;
  height: 100%;
  padding-top: 20px;
`;
