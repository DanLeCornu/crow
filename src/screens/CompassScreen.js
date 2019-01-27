import React from 'react';
import { View, TouchableHighlight } from 'react-native';
import { CustomText } from '../components/CustomText'
import Compass from '../components/Compass';
import styled from 'styled-components';
import AppContext from '../AppContext';

class CompassScreen extends React.Component {

  render() {
    const { distanceToNextWaypoint, skipNextWaypoint, waypoints, finishRoute } = this.props;

    return (
      <Container>
        <CompassContainer>
          <Compass />
        </CompassContainer>
        <DistanceContainer>
          <Distance>
            <DistanceText>{distanceToNextWaypoint}</DistanceText><UnitText>KM</UnitText>
          </Distance>
        </DistanceContainer>
        {waypoints.length > 0 &&
          <SkipButton onPress={() => skipNextWaypoint()}>
            <ButtonText>SKIP WAYPOINT</ButtonText>
          </SkipButton>
        }
        <MapButton onPress={() => finishRoute()}>
          <ButtonText>FINISH ROUTE</ButtonText>
        </MapButton>
      </Container>
    );
  }
}

export default class CompassScreenContainer extends React.Component {
  render() {
    return (
      <AppContext.Consumer>
        {context => <CompassScreen {...context} />}
      </AppContext.Consumer>
    );
  }
}

const Container = styled(View)`
  width: 50%;
  height: 100%;
`
const CompassContainer = styled(View)`
  height: 60%;
  width: 100%;
  justify-content: center;
  align-items: center;
`
const DistanceContainer = styled(View)`
  height: 20%;
  width: 100%;
  justify-content: center;
  align-items: center;
`
const Distance = styled(View)`
  flex-direction: row;
  align-items: baseline;
`
const DistanceText = styled(CustomText)`
  font-size: 42px;
`
const UnitText = styled(CustomText)`
  font-size: 18px;
  margin-left: 5px;
`
const MapButton = styled(TouchableHighlight)`
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 10%;
  background: #fd6477;
  shadow-color: #000;
  shadow-opacity: 0.1;
`
const SkipButton = styled(TouchableHighlight)`
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 10%;
  background: #fd6477;
  shadow-color: #000;
  shadow-opacity: 0.1;
`
const ButtonText = styled(CustomText)`
  color: white;
  font-size: 18px;
`