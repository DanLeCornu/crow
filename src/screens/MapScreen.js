import React from 'react';
import { MapView } from 'expo';
import { View, Image, Animated, TouchableHighlight, Linking } from 'react-native';
import { CustomText } from '../components/CustomText'
import { Marker } from 'react-native-maps';
import AppContext from '../AppContext';
import styled from 'styled-components';

class MapScreen extends React.Component {
  state = {
    actionsPosition: new Animated.Value(-50),
  };

  handleSetDestination = e => {
    const destination = [
      parseFloat(JSON.stringify(e.nativeEvent.coordinate.latitude)),
      parseFloat(JSON.stringify(e.nativeEvent.coordinate.longitude)),
    ];
    this.props.setDestination(destination);
    this.showMapActions();
  };

  handleClearDestination = () => {
    this.props.clearDestination();
    this.hideMapActions();
  }

  showMapActions = () => {
    Animated.timing(this.state.actionsPosition, {
      toValue: 0,
      duration: 200,
    }).start();
  };

  hideMapActions = () => {
    Animated.timing(this.state.actionsPosition, {
      toValue: -50,
      duration: 200,
    }).start();
  };

  handleConfirmRoute = () => {
    this.props.setScreen('Compass')
    this.hideMapActions()
  }

  render() {
    const { actionsPosition } = this.state;
    const {
      location,
      destination,
      distance,
    } = this.props;

    return (
      <Container>
        
        <PrivacyButton onPress={() => Linking.openURL('https://www.noquarter.co/privacy/crow')}>
          <PrivacyButtonImage source={require('../../assets/images/privacy_button.png')} />
        </PrivacyButton>
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
            this.handleSetDestination(e);
          }}
        >
          {destination &&
            <Marker
              image={require('../../assets/images/crow_marker.png')}
              draggable
              coordinate={{
                latitude: destination[0],
                longitude: destination[1],
              }}
              onDragEnd={e => {
                this.handleSetDestination(e);
              }}
            />
          }
        </Map>
        <ActionsContainer style={{bottom: actionsPosition}}>
          {!destination &&
            <ActionsHeader>Tap the map to set destination</ActionsHeader>
          }
          <Actions>
            <ActionsDistanceContainer>
              <ActionsDistance>
                <DistanceText>{distance}</DistanceText><UnitText>KM</UnitText>
              </ActionsDistance>
            </ActionsDistanceContainer>
            <ActionsButtons>
              <ButtonReject onPress={() => this.handleClearDestination()}>
                <Icon source={require('../../assets/images/cross.png')}/>
              </ButtonReject>
              <ButtonConfirm onPress={() => this.handleConfirmRoute()}>
                <Icon source={require('../../assets/images/tick.png')}/>
              </ButtonConfirm>
            </ActionsButtons>
          </Actions>
        </ActionsContainer>
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
const ActionsHeader = styled(CustomText)`
  height: 30px;
  text-align: center;
  line-height: 30px;
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
const Icon = styled(Image)`
  height: 25px;
  width: 25px;
`
const PrivacyButton = styled(TouchableHighlight)`
  position: absolute;
  z-index: 1;
  top: 10px;
  left: 10px;
`
const PrivacyButtonImage = styled(Image)`
  width: 40px;
  height: 40px;
`
