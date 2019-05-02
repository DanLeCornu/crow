import React from 'react';
import { CustomText } from '../components/CustomText'
import styled from 'styled-components';
import AppContext from '../AppContext';

import Button from '../components/Button'

class IntroScreen extends React.Component {
  render() {
    const {theme, moveTo} = this.props;
    return (
      <>
        <Container background={theme}>
          <MapContainer>
            <Map source={require('../../assets/images/map.png')}/>
          </MapContainer>
          <TextContainer>
            <IntroText>tap the map to set your destination</IntroText>
          </TextContainer>
          <ButtonContainer>
            <Button onPress={() => moveTo('right')} text="NEXT"/>
          </ButtonContainer>
        </Container>
        <Container background={theme}>
          <CompassContainer>
            <Compass>
              <CompassRing source={require('../../assets/images/compass_ring.png')} />
              <CompassArrow source={require('../../assets/images/navigate_arrow.png')}/>
            </Compass>
          </CompassContainer>
          <TextContainer>
            <IntroText>let the compass guide you</IntroText>
          </TextContainer>
          <ButtonContainer>
            <Button onPress={() => moveTo('right')} text="LET'S GO !"/>
          </ButtonContainer>
        </Container>
      </>
    );
  }
}

export default class IntroScreenContainer extends React.Component {
  render() {
    return (
      <AppContext.Consumer>
        {context => <IntroScreen {...context} />}
      </AppContext.Consumer>
    );
  }
}

const Container = styled.View`
  width: 20%;
  height: 100%;
  background: ${props => props.background};
`
const MapContainer = styled.View`
  height: 55%;
  align-items: center;
  justify-content: flex-end;
  box-shadow: 0px 5px 5px rgba(0, 0, 0, 0.25);
`
const Map = styled.Image`
  width: 75%;
  height: 75%;
  resize-mode: contain;
`
const CompassContainer = styled.View`
  height: 55%;
  align-items: center;
  justify-content: flex-end;
`
const Compass = styled.View`
  height: 75%;
  align-items: center;
  justify-content: center;
`
const CompassRing = styled.Image`
  resize-mode: contain;
  box-shadow: 0px 5px 5px rgba(0, 0, 0, 0.25);
`
const CompassArrow = styled.Image`
  position: absolute;
  box-shadow: 0px 5px 5px rgba(0, 0, 0, 0.25);
`
const TextContainer = styled.View`
  height: 25%;
  justify-content: center;
`
const IntroText = styled(CustomText)`
  text-align: center;
  width: 60%;
  font-size: 22px;
  margin: 0 auto;
`
const ButtonContainer = styled.View`
  height: 20%;
  flex-direction: row;
  justify-content: center;
`