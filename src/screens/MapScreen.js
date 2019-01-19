import React from 'react';
import { MapView } from 'expo';
import { Text, View, Button, Animated, Easing } from 'react-native';
import MapViewDirections from 'react-native-maps-directions';
import { Marker } from 'react-native-maps';
import { Alert } from '../components/Alert';
import styled from 'styled-components';
import AppContext from '../AppContext';

// Put on config file
const GOOGLE_MAPS_APIKEY = 'AIzaSyCu0hjf3aN3d37UJViHdOCoGhlqK7h5Fdg';

class MapScreen extends React.Component {
  state = {
    animation: new Animated.Value(0),
  };

  componentDidMount() {
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

  handleSetDestination = e => {
    if (!this.props.destination) {
      const destination = [
        parseFloat(JSON.stringify(e.nativeEvent.coordinate.latitude)),
        parseFloat(JSON.stringify(e.nativeEvent.coordinate.longitude)),
      ];
      this.props.setDestination(destination);
    }
  };

  render() {
    const { animation } = this.state;
    const {
      alert,
      location,
      destination,
      clearDestination,
      setAlert,
      hideAlert,
    } = this.props;

    return (
      <>
        {!location ? (
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
            {alert && <Alert onPress={() => hideAlert()}>⚠️ {alert}</Alert>}
            <Map
              showsUserLocation
              initialRegion={{
                latitude: location[0],
                longitude: location[1],
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
              }}
              onPress={e => {
                this.handleSetDestination(e);
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
                      this.handleSetDestination(e);
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
                    onError={() => setAlert('Could not calculate route')}
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
                    onPress={() => clearDestination()}
                  />
                </ClearButton>
                <ConfirmButton>
                  <Button
                    title="Confirm"
                    color="white"
                    onPress={() => this.props.setScreen('Compass')}
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

export default class MapScreenContainer extends React.Component {
  render() {
    return (
      <AppContext.Consumer>
        {context => <MapScreen {...context} />}
      </AppContext.Consumer>
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
