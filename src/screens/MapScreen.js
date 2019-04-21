import React from 'react';
import { MapView } from 'expo';
import { View, Image, Animated, TouchableHighlight, Linking, Dimensions } from 'react-native';
import { CustomText } from '../components/CustomText'
import { Marker } from 'react-native-maps';
import AppContext from '../AppContext';
import styled from 'styled-components';

class MapScreen extends React.Component {
  state = {
    actionsPosition: new Animated.Value(-80),
    markerWidth: Dimensions.get('window').width * 0.10
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
      toValue: -80,
      duration: 200,
    }).start();
  };

  handleConfirmRoute = () => {
    this.props.setScreen('Compass')
    this.hideMapActions()
  }

  render() {
    const { actionsPosition, markerWidth } = this.state;
    const {
      location,
      destination,
      distance,
      theme,
    } = this.props;

    return (
      <Container>
        <PrivacyButton onPress={() => Linking.openURL('https://www.noquarter.co/privacy/crow')}>
          <PrivacyButtonImage source={require('../../assets/images/privacyButton.png')} />
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
              draggable
              coordinate={{
                latitude: destination[0],
                longitude: destination[1],
              }}
              onDragEnd={e => {
                this.handleSetDestination(e);
              }}
            >
              <MarkerIcon
                source={require('../../assets/images/crow.png')}
                width={markerWidth}
              />
            </Marker>
          }
        </Map>
        <ActionsContainer style={{bottom: actionsPosition}}>
          <Actions>
            <ActionsDistanceContainer>
              <ActionsDistance>
                <DistanceText>{distance}</DistanceText><UnitText>KM</UnitText>
              </ActionsDistance>
            </ActionsDistanceContainer>
            <ActionsButtons>
              <ButtonConfirm background={theme} onPress={() => this.handleConfirmRoute()}>
                <ButtonIcon source={require('../../assets/images/navigateArrow.png')}/>
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
  width: 33.33%;
  height: 100%;
  background: white;
`
const Map = styled(MapView)`
  height: 100%;
`
const ActionsContainer = styled(Animated.View)`
  position: absolute;
  width: 100%;
  height: 80px;
  background: white;
`
const Actions = styled.View`
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
  color: white;
`
const UnitText = styled(CustomText)`
  font-size: 18px;
  margin-left: 5px;
  color: white;
`
const ActionsButtons = styled(View)`
  height: 100%;
  width: 50%;
  flex-direction: row;
  justify-content: flex-end;
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
  background: ${props => props.background};
  margin: 0 15px 0 15px;
`
const ButtonIcon = styled(Image)`
  height: 50px;
  width: 50px;
  margin: 0 0 3px 3px;
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
const MarkerIcon = styled.Image`
  width: ${props => `${props.width}px`};
  height: ${props => `${props.width}px`};
`