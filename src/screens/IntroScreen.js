import React from 'react';
import { View, Image } from 'react-native';
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
          <Map source={require('../../assets/images/map.png')}/>
          <CustomText>tap the map to set you destination</CustomText>
          <Button onPress={() => moveTo('right')} text="NEXT"/>
        </Container>
        <Container background={theme}>
          <Compass>
            {/* <CompassRing source={require('../../assets/images/compassRing.png')} /> */}
            {/* <CompassArrow source={require('../../assets/images/navigateArrow.png')}/> */}
          </Compass>
          <CustomText>let the compass guide you</CustomText>
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

const Container = styled(View)`
  width: 25%;
  height: 100%;
  background: ${props => props.background};
  flex-direction: column;
  justify-content: space-between;
`
const Map = styled(Image)`
  width: 75%;
  resize-mode: contain;
`
const Compass = styled(View)`
height: 40%;
  margin-top: 20%;
  justify-content: center;
  align-items: center;
  border: 1px solid black;
`
// const CompassRing = styled(Image)`
//   width: 80%;
//   max-height: 100%;
// `
// const CompassArrow = styled(Image)`
//   position: absolute;
// `
const ButtonContainer = styled(View)`
  margin-bottom: 25%;
  flex-direction: row;
  justify-content: center;
`