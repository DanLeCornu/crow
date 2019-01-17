import React from 'react';
import { MapView, Location, Permissions } from 'expo';
import { Text, View, Button, Animated, Easing } from 'react-native';
import MapViewDirections from 'react-native-maps-directions';
import { Marker } from 'react-native-maps';

import { Alert } from '../components/Alert';

import styled from 'styled-components';

export default class MapScreen extends React.Component {
  static navigationOptions = {
    title: 'Map',
    header: null,
  };

  state = {
    errorMessage: null,
    loading: true,
    heading: null,
    bearing: null,
    location: null,
    destination: null,
    animation: new Animated.Value(0),
    place: null,
  };

  componentDidMount() {
    this.requestPermissions();
    this.getCurrentLocation();
    this.getLocation();
    this.startAnimation();
  }

  startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.state.animation, {
          toValue: -20,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(this.state.animation, {
          toValue: 0,
          duration: 700,
          easing: Easing.bounce,
        }),
      ]),
    ).start();
  };

  requestPermissions = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Location premission denied.',
      });
    } else {
      this.setState({ errorMessage: null });
    }
  };

  getCurrentLocation = async () => {
    let data = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true,
    });
    let location = [data.coords.latitude, data.coords.longitude];
    this.setState({ location, loading: false });
  };

  getLocation = async () => {
    Location.watchPositionAsync(
      {
        enableHighAccuracy: true,
        distanceInterval: 5,
      },
      data => {
        let location = [data.coords.latitude, data.coords.longitude];
        this.setState({ location });
      },
    );
  };

  handleMapPress = e => {
    if (!this.state.destination) {
      let destination = [
        parseFloat(JSON.stringify(e.nativeEvent.coordinate.latitude)),
        parseFloat(JSON.stringify(e.nativeEvent.coordinate.longitude)),
      ];
      this.setState({ destination });
    }
  };

  handleMarkerDragEnd = e => {
    let destination = [
      parseFloat(JSON.stringify(e.nativeEvent.coordinate.latitude)),
      parseFloat(JSON.stringify(e.nativeEvent.coordinate.longitude)),
    ];
    this.setState({ destination });
  };

  handleClearDestination = () => {
    this.setState({ destination: null });
  };

  handleHideError = () => {
    this.setState({ errorMessage: null });
  };

  render() {
    const {
      errorMessage,
      loading,
      location,
      destination,
      animation,
    } = this.state;
    const GOOGLE_MAPS_APIKEY = 'AIzaSyCu0hjf3aN3d37UJViHdOCoGhlqK7h5Fdg';

    return (
      <>
        {loading ? (
          <>
            <LoadingContainer>
              <LoadingText>Fetching your location ...</LoadingText>
              <Crow
                style={{ transform: [{ translateY: animation }] }}
                source={require('../../assets/images/crow.png')}
              />
            </LoadingContainer>
          </>
        ) : (
          <>
            {errorMessage && (
              <Alert onPress={() => this.handleHideError()}>
                ⚠️ {errorMessage}
              </Alert>
            )}
            <Map
              showsUserLocation
              initialRegion={{
                latitude: location[0],
                longitude: location[1],
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
              }}
              onPress={e => {
                this.handleMapPress(e);
              }}
            >
              {destination && (
                <>
                  <Marker
                    draggable
                    coordinate={{
                      latitude: destination[0],
                      longitude: destination[1],
                    }}
                    onDragEnd={e => {
                      this.handleMarkerDragEnd(e);
                    }}
                  />
                  <MapViewDirections
                    origin={{ latitude: location[0], longitude: location[1] }}
                    destination={{
                      latitude: destination[0],
                      longitude: destination[1],
                    }}
                    apikey={GOOGLE_MAPS_APIKEY}
                    strokeWidth={3}
                    strokeColor="#01b3fd"
                    mode="bicycling"
                    onError={() =>
                      this.setState({
                        errorMessage: 'Could not calculate route',
                      })
                    }
                  />
                </>
              )}
            </Map>
            {destination ? (
              <Actions>
                <ClearButton>
                  <Button
                    title="Clear"
                    color="white"
                    onPress={() => this.handleClearDestination()}
                  />
                </ClearButton>
                <ConfirmButton>
                  <Button
                    title="Confirm"
                    color="white"
                    onPress={() =>
                      this.props.navigation.navigate('Compass', {
                        destination,
                      })
                    }
                  />
                </ConfirmButton>
              </Actions>
            ) : (
              <InfoContainer>
                <InfoText>Tap the map to set destination</InfoText>
              </InfoContainer>
            )}
          </>
        )}
      </>
    );
  }
}

const Map = styled(MapView)`
  height: 100%;
`;

const Actions = styled(View)`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 60px;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;

const ButtonContainer = styled(View)`
  width: 45%;
  border-radius: 10px;
`;

const ClearButton = styled(ButtonContainer)`
  background: #ff595c;
`;

const ConfirmButton = styled(ButtonContainer)`
  background: #3fdcad;
`;

const InfoContainer = styled(View)`
  position: absolute;
  height: 50px;
  width: 100%;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1;
  justify-content: center;
  align-items: center;
`;

const InfoText = styled(Text)`
  color: white;
  font-size: 16px;
`;

const LoadingContainer = styled(View)`
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const LoadingText = styled(Text)`
  margin: 0 0 40px 25px;
  font-size: 20px;
`;

const Crow = styled(Animated.Image)`
  width: 70px;
  height: 70px;
  resize-mode: contain;
`;
