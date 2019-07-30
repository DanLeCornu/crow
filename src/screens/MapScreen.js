import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated, Linking, Dimensions, Alert } from 'react-native';
import { CustomText } from '../components/CustomText'
import MapView, { Marker } from 'react-native-maps';
import AppContext from '../AppContext';
import styled from 'styled-components';

import { GRANTED, GRANTED_IN_USE } from '../lib/constants'

class MapScreen extends React.Component {
  state = {
    actionsPosition: new Animated.Value(-200),
    markerWidth: Dimensions.get('window').width * 0.10
  };

  handleSetDestination = e => {
    const destination = [
      parseFloat(JSON.stringify(e.nativeEvent.coordinate.latitude)),
      parseFloat(JSON.stringify(e.nativeEvent.coordinate.longitude)),
    ];
    this.props.setRoute(destination);
    this.showMapActions();
  };

  showMapActions = () => {
    Animated.timing(this.state.actionsPosition, {
      toValue: 0,
      duration: 200,
    }).start();
  };

  hideMapActions = () => {
    Animated.timing(this.state.actionsPosition, {
      toValue: -200,
      duration: 200,
    }).start();
  };

  handleConfirmRoute = async () => {
    await this.props.askLocationPermission()
    if (this.props.permissionStatus == GRANTED || this.props.permissionStatus == GRANTED_IN_USE) {
      this.props.moveTo('right')
    } else (
      Alert.alert(
        'Location Permissions',
        'Hey! We need your permission to access your location, in order for the Crow app to work. Please go to your app settings and select "Always" for location :)',
        [{ text: 'OK, will do!', onPress: () => { Linking.openURL('app-settings:') }}],
        { cancelable: false }
      )
    )
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
            <ActionsBackground colors={['transparent','rgba(0,0,0,0.8)']}>
              <Actions>
                <ActionsDistanceContainer>
                  <ActionsDistance>
                    <DistanceIcon source={require('../../assets/images/directions_white.png')}/>
                    <DistanceText>{distance}</DistanceText><UnitText>KM</UnitText>
                  </ActionsDistance>
                </ActionsDistanceContainer>
                <ActionsButtons>
                  <ButtonConfirm background={theme} onPress={() => this.handleConfirmRoute()}>
                    <ButtonIcon source={require('../../assets/images/navigate_arrow.png')}/>
                  </ButtonConfirm>
                </ActionsButtons>
              </Actions>
            </ActionsBackground>
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

const Container = styled.View`
  width: 20%;
  height: 100%;
`
const Map = styled(MapView)`
  height: 100%;
`
const ActionsContainer = styled(Animated.View)`
  position: absolute;
  width: 100%;
  height: 200px;
`
const ActionsBackground = styled(LinearGradient)`
  width: 100%;
  height: 100%;
  justify-content: flex-end;
`
const Actions = styled.View`
  height: 100px;
  width: 100%;
  flex-wrap: wrap;
`
const ActionsDistanceContainer = styled.View`
  width: 50%;
  height: 100%;
  justify-content: flex-end;
`
const ActionsDistance = styled.View`
  flex-direction: row;
  align-items: baseline;
  margin: 0 0 20px 20px;
`
const DistanceIcon = styled.Image`
  height: 40px;
  width: 40px;
  margin: 0 10px 0 0;
`
const DistanceText = styled(CustomText)`
  font-size: 36px;
  color: white;
`
const UnitText = styled(CustomText)`
  font-size: 18px;
  margin-left: 5px;
  color: white;
`
const ActionsButtons = styled.View`
  height: 100%;
  width: 50%;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`
const Button = styled.TouchableHighlight`
  width: 50px;
  height: 50px;
  border-radius: 30px;
  justify-content: center;
  align-items: center;
`
const ButtonConfirm = styled(Button)`
  background: ${props => props.background};
  margin: 0 20px 0 20px;
`
const ButtonIcon = styled.Image`
  height: 50px;
  width: 50px;
  margin: 0 0 3px 3px;
`
const PrivacyButton = styled.TouchableHighlight`
  position: absolute;
  z-index: 1;
  top: 10px;
  left: 10px;
`
const PrivacyButtonImage = styled.Image`
  width: 40px;
  height: 40px;
`
const MarkerIcon = styled.Image`
  width: ${props => `${props.width}px`};
  height: ${props => `${props.width}px`};
`