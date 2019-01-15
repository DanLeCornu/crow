import React from 'react';
import { MapView, Location, Permissions } from 'expo';
import { Text, View, Button, Animated } from 'react-native';

import MapViewDirections from 'react-native-maps-directions';
import { Marker } from 'react-native-maps';

import styled from 'styled-components';
import { Easing } from 'react-native-reanimated';

export default class MapScreen extends React.Component {
  static navigationOptions = {
    title: 'Map',
  };

  state = {
    errorMessage: null,
    loading: true,
    heading: null,
    bearing: null,
    location: [0, 0],
    destination: [0, 0],
    destinationSet: false,
    animation: new Animated.Value(0),
  };

  componentDidMount() {
    this.requestPermissions();
    this.getCurrentLocation();
    this.getLocation();

    Animated.loop(
      Animated.sequence([
        Animated.timing(this.state.animation, {
          toValue: 10,
          duration: 400,
          easing: Easing.linear,
        }),
        Animated.timing(this.state.animation, {
          toValue: 0,
          duration: 200,
          easing: Easing.linear,
        }),
      ]),
    ).start();
  }

  requestPermissions = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage:
          'Permission to access location was denied, Please go to app settings to grant location services.',
      });
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
    if (!this.state.destinationSet) {
      let destination = [
        parseFloat(JSON.stringify(e.nativeEvent.coordinate.latitude)),
        parseFloat(JSON.stringify(e.nativeEvent.coordinate.longitude)),
      ];
      this.setState({ destination, destinationSet: true });
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
    this.setState({ destinationSet: false });
  };

  render() {
    const {
      loading,
      location,
      destination,
      destinationSet,
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
            <InfoContainer>
              <InfoText>
                {destinationSet
                  ? 'Press and drag the marker to change destination'
                  : 'Tap the map to set destination'}
              </InfoText>
            </InfoContainer>
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
              {destinationSet && (
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
                  />
                </>
              )}
            </Map>
          </>
        )}
        {destinationSet && (
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
  display: flex;
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
  top: 64px;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1;
  display: flex;
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
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoadingText = styled(Text)`
  margin: 0 0 20px 20px;
  font-size: 22px;
`;

const Crow = styled(Animated.Image)`
  width: 70px;
  height: 70px;
`;
