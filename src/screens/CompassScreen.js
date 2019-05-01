import React from 'react';
import { View, TouchableHighlight } from 'react-native';
import { CustomText } from '../components/CustomText'
import Compass from '../components/Compass';
import styled from 'styled-components';
import AppContext from '../AppContext';

class CompassScreen extends React.Component {

  finishRoute = () => {
    this.props.moveTo('left')
    setTimeout(() => {
      this.props.clearDestination()
    }, 300)
  }

  render() {
    const { distance } = this.props;

    return (
      <Container>
        <CompassContainer>
          <Compass />
        </CompassContainer>
        <DistanceContainer>
          <Distance>
            <DistanceText>{distance}</DistanceText><UnitText>KM</UnitText>
          </Distance>
          <NextWaypointText>TO DESTINATION</NextWaypointText>
        </DistanceContainer>
        <Buttons>
          <MapButton onPress={() => this.finishRoute()}>
            <ButtonText>FINISH ROUTE</ButtonText>
          </MapButton>
        </Buttons>
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
  width: 20%;
  height: 100%;
  background: white;
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
const NextWaypointText = styled(CustomText)`
  color: grey;
  font-size: 14px;
  text-align: center;
  margin-top: -10px;
`
const Buttons = styled(View)`
  justify-content: flex-end;
  height: 20%;
  width: 100%;
`
const Button = styled(TouchableHighlight)`
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50%;
  shadow-color: #000;
  shadow-opacity: 0.1;
`
const MapButton = styled(Button)`
  background: #fd6477;
`
const ButtonText = styled(CustomText)`
  color: white;
  font-size: 18px;
`