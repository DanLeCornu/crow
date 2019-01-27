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
    distanceToNextWaypoint: 0,
    waypoints: [],
    screenPosition: new Animated.Value(0),
    alertPosition: new Animated.Value(-40),
    addWaypoint: waypoint => this.addWaypoint(waypoint),
    changeWaypoint: (i,waypoint) => this.changeWaypoint(i,waypoint),
    clearLatestWaypoint: () => this.clearLatestWaypoint(),
    changeDestination: destination => this.changeDestination(destination),
    skipNextWaypoint: () => this.skipNextWaypoint(),
    setAlert: alert => this.setAlert(alert),
    hideAlert: () => this.hideAlert(),
    setScreen: screen => this.setScreen(screen),
    finishRoute: () => this.finishRoute(),
  };

  componentDidMount() {
    this.requestPermissions();
    this.subscribeToLocation();
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.destination) {
      if (prevState.location != this.state.location) {
        this.setDistanceToNextWaypoint()
      }
    }
  };

  addWaypoint = async waypoint => {
    const length = this.state.waypoints.length
    if (length == 0 && !this.state.destination) {
      await this.setState({ destination: waypoint })
    } else if (length < 10 && this.state.destination) {
      const destination = this.state.destination
      let waypoints = this.state.waypoints
      waypoints.push(destination)
      await this.setState({ waypoints, destination: waypoint })
    } else if (length >= 10) {
      this.setAlert("Maximum 10 waypoints allowed")
    }
    this.setDistanceToNextWaypoint()
  }

  changeWaypoint = (i,waypoint) => {
    let waypoints = this.state.waypoints
    waypoints[i] = waypoint
    this.setState({ waypoints })
    if (i == 0) {
      this.setDistanceToNextWaypoint()
    }
    // force update of route polylines by slightly modifying destination coords (DIRTY!!)
    let destination = this.state.destination
    destination = [destination[0], destination[1]+0.00001]
    this.setState({destination})
  }
  
  clearLatestWaypoint = () => {
    if (this.state.waypoints.length > 0) {
      let waypoints = this.state.waypoints
      this.setState({ destination: waypoints.slice(-1)[0] })
      waypoints.pop()
      this.setState({ waypoints })
    } else {
      this.setState({ destination: null})
    }
  }

  skipNextWaypoint = () => {
    if (this.state.waypoints.length > 0) {
      let waypoints = this.state.waypoints
      waypoints.shift()
      this.setState({ waypoints })
      this.setDistanceToNextWaypoint()
    } else {
      this.setState({ destination: null})
      this.setState({ distanceToNextWaypoint: 0 })
    }
  }

  changeDestination = async destination => {
    await this.setState({ destination });
    this.setDistanceToNextWaypoint()
  };

  setDistanceToNextWaypoint = () => {
    let nextWaypoint
    if (this.state.waypoints.length > 0) {
      nextWaypoint = this.state.waypoints[0]
    } else {
      nextWaypoint = this.state.destination
    }
    let distanceM = Geolib.getDistance(
      {
        latitude: this.state.location[0],
        longitude: this.state.location[1],
      },
      {
        latitude: nextWaypoint[0],
        longitude: nextWaypoint[1],
      },
    )
    let distanceToNextWaypoint = (distanceM / 1000).toFixed(2);
    this.setState({ distanceToNextWaypoint })
  }

  finishRoute = () => {
    this.setState({ destination: null, waypoints: [] })
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
      ]),
      Font.loadAsync({
        'open-sans': require('../assets/fonts/OpenSans-Regular.ttf'),
        'open-sans-bold': require('../assets/fonts/OpenSans-Bold.ttf'),
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