import React from 'react';
import { MapView } from 'expo';
import { View, Image, Animated, Easing, Linking, TouchableHighlight } from 'react-native';
import { CustomText } from '../components/CustomText'
import MapViewDirections from 'react-native-maps-directions';
import { Marker } from 'react-native-maps';
import AppContext from '../AppContext';
import { GOOGLE_MAPS_APIKEY } from '../../Config';
import styled from 'styled-components';

class MapScreen extends React.Component {
  state = {
    crowPosition: new Animated.Value(0),
    actionsPosition: new Animated.Value(-80),
  };

  componentDidMount() {
    this.bounceCrow();
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

  handleAddWaypoint = e => {
    const waypoint = [
      parseFloat(JSON.stringify(e.nativeEvent.coordinate.latitude)),
      parseFloat(JSON.stringify(e.nativeEvent.coordinate.longitude)),
    ];
    this.props.addWaypoint(waypoint);
    if (!this.props.destination) {
      this.showActions();      
    }
  }

  handleChangeWaypoint = (i,e) => {
    const waypoint = [
      parseFloat(JSON.stringify(e.nativeEvent.coordinate.latitude)),
      parseFloat(JSON.stringify(e.nativeEvent.coordinate.longitude)),
    ];
    this.props.changeWaypoint(i,waypoint);
  }

  handleClearLatestWaypoint = async () => {
    await this.props.clearLatestWaypoint();
    if (!this.props.destination) {
      this.hideActions();
    }
  }

  handleChangeDestination = e => {
    const destination = [
      parseFloat(JSON.stringify(e.nativeEvent.coordinate.latitude)),
      parseFloat(JSON.stringify(e.nativeEvent.coordinate.longitude)),
    ];
    this.props.changeDestination(destination);
  };

  showActions = () => {
    Animated.timing(this.state.actionsPosition, {
      toValue: 0,
      duration: 200,
    }).start();
  };

  hideActions = () => {
    Animated.timing(this.state.actionsPosition, {
      toValue: -80,
      duration: 200,
    }).start();
  };

  render() {
    const { crowPosition, actionsPosition } = this.state;
    const {
      location,
      waypoints,
      destination,
      setAlert,
      distanceToNextWaypoint,
      setScreen
    } = this.props;

    return (
      <Container>
        {!location ? (
          <>
            <LoadingContainer>
              <Crow
                style={{ transform: [{ translateY: crowPosition }] }}
                source={require('../../assets/images/crow.png')}
              />
              <LoadingText>fetching your location ...</LoadingText>
                <NQ onPress={() => Linking.openURL('https://www.noquarter.co')}>
                  a <NQLogo source={require('../../assets/images/nq_logo.png')} /> production
                </NQ>
            </LoadingContainer>
          </>
        ) : (
          <>
            <Map
              showsUserLocation
              mapType="mutedStandard"
              showsPointsOfInterest={false}
              initialRegion={{
                latitude: location[0],
                longitude: location[1],
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
              }}
              onPress={e => {
                this.handleAddWaypoint(e);
              }}
            >
              {waypoints.length > 0 && waypoints.map((waypoint,i) =>
                  <Marker
                    key={i}
                    draggable
                    coordinate={{
                      latitude: waypoint[0],
                      longitude: waypoint[1],
                    }}
                    onDragEnd={e => {
                      this.handleChangeWaypoint(i,e);
                    }}
                  />
              )}
              {destination &&
                <Marker
                  draggable
                  coordinate={{
                    latitude: destination[0],
                    longitude: destination[1],
                  }}
                  onDragEnd={e => {
                    this.handleChangeDestination(e);
                  }}
                />
              }
              {destination &&
                <MapViewDirections
                  origin={{ latitude: location[0], longitude: location[1] }}
                  destination={{
                    latitude: destination[0],
                    longitude: destination[1],
                  }}
                  waypoints={waypoints}
                  apikey={GOOGLE_MAPS_APIKEY}
                  strokeWidth={3}
                  strokeColor="#01b3fd"
                  mode="walking"
                  resetOnChange={false}
                  onError={() => setAlert('Could not calculate route')}
                />
              }
            </Map>
            {destination &&
              <ActionsContainer style={{bottom: actionsPosition}}>
                <Actions>
                  <ActionsDistanceContainer>
                    <ActionsDistance>
                      <DistanceText>{distanceToNextWaypoint}</DistanceText><UnitText>KM</UnitText>
                    </ActionsDistance>
                  </ActionsDistanceContainer>
                  <ActionsButtons>
                    <ButtonReject onPress={() => this.handleClearLatestWaypoint()}>
                      <Cross source={require('../../assets/images/cross.png')}/>
                    </ButtonReject>
                    <ButtonConfirm onPress={() => setScreen('Compass')}>
                      <Tick source={require('../../assets/images/tick.png')}/>
                    </ButtonConfirm>
                  </ActionsButtons>
                </Actions>
              </ActionsContainer>
            }
          </>
        )}
      </Container>
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

const Container = styled(View)`
  width: 50%;
  height: 100%;
`
const Map = styled(MapView)`
  height: 100%;
`
const ActionsContainer = styled(Animated.View)`
  position: absolute;
  width: 94%;
  height: 80px;
  margin: 0 3% 0 3%;
  background: white;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  shadow-color: #000;
  shadow-opacity: 0.1;
`
const Actions = styled(View)`
  height: 100%;
  width: 100%;
  flex-wrap: wrap;
`
const ActionsDistanceContainer = styled(View)`
  width: 50%;
  height: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`
const ActionsDistance = styled(View)`
  flex-direction: row;
  align-items: baseline;
`
const DistanceText = styled(CustomText)`
  font-size: 32px;
`
const UnitText = styled(CustomText)`
  font-size: 18px;
  margin-left: 5px;
`
const ActionsButtons = styled(View)`
  height: 100%;
  width: 50%;
  flex-direction: row;
  justify-content: flex-end;;
  align-items: center;
`
const Button = styled(TouchableHighlight)`
  width: 50px;
  height: 50px;
  border-radius: 30px;
  justify-content: center;
  align-items: center;
`
const ButtonConfirm = styled(Button)`
  background: #7bbb5e;
  margin: 0 15px 0 15px;
`
const ButtonReject = styled(Button)`
  background: #fd6477;
`
const Cross = styled(Image)`
  height: 20px;
  width: 20px;
`
const Tick = styled(Image)`
  height: 25px;
  width: 25px;
`
const LoadingContainer = styled(View)`
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
  width: 25px;
  height: 25px;
  margin-right: 10px;
  resize-mode: contain;
`
const NQ = styled(CustomText)`
  position: absolute;
  bottom: 20px;
  width: 100%;
  text-align: center;
  line-height: 40px;
  font-size: 20px;
`
const NQLogo = styled(Image)`
  width: 40px;
  height: 40px;
  border-radius: 10px;
`
