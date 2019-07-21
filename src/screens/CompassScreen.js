import React from 'react';
import { CustomText } from '../components/CustomText'
import Compass from '../components/Compass';
import styled from 'styled-components';
import AppContext from '../AppContext';

import Button from '../components/Button'

class CompassScreen extends React.Component {

  render() {
    const { theme, distance, bleConnected, bleConnecting, bleDisconnecting } = this.props;
    return (
      <Container background={theme}>
        <CompassContainer>
          {bleConnected ? (
            <CustomText>Use the prototype hardware for direction :)</CustomText>
          ) : (
            <Compass />
          )
          }
        </CompassContainer>
        <DistanceContainer>
          <TextContainer>
          {!bleConnected &&
            <>
              <DistanceIcon source={require('../../assets/images/directions_black.png')}/>
              <DistanceText>{distance}</DistanceText><UnitText>KM</UnitText>
            </>
          }
          </TextContainer>
        </DistanceContainer>
        <ButtonContainer>
          {!bleConnected && !bleConnecting &&
            <Button onPress={() => this.props.BleConnect()} text="CONNECT" />
          }
          {bleConnecting &&
            <Button disabled text="CONNECTING ..." />
          }
          {bleDisconnecting &&
            <Button disabled text="DISCONNECTING ..." />
          }
          {(bleConnected && !bleDisconnecting) &&
            <Button onPress={() => this.props.BleDisconnect()} text="DISCONNECT" />
          }
          <Button onPress={() => this.props.moveTo('left')} text="BACK TO MAP"/>
        </ButtonContainer>
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

const Container = styled.View`
  width: 20%;
  height: 100%;
  background: ${props => props.background};
`
const CompassContainer = styled.View`
  height: 55%;
  align-items: center;
  justify-content: flex-end;
`
const DistanceContainer = styled.View`
  height: 25%;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`
const TextContainer = styled.View`
  flex-direction: row;
  align-items: baseline;
`
const DistanceIcon = styled.Image`
  height: 40px;
  width: 40px;
  margin: 0 10px 0 0;
`
const DistanceText = styled(CustomText)`
  font-size: 36px;
`
const UnitText = styled(CustomText)`
  font-size: 18px;
  margin-left: 5px;
`
const ButtonContainer = styled.View`
  height: 20%;
  align-items: center;
`