import React from 'react';
import { Animated, Easing } from 'react-native';
import { CustomText } from '../components/CustomText'
import styled from 'styled-components';
import AppContext from '../AppContext';

class LoadingScreen extends React.Component {
  state = {
    crowPosition: new Animated.Value(0),
  }

  componentDidMount() {
    this.bounceCrow()
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
      {iterations: 2}
    ).start();
  };

  render() {
    const {theme} = this.props;
    const {crowPosition} = this.state;
    return (
      <Container background={theme}>
        <Crow
          style={{ transform: [{ translateY: crowPosition }] }}
          source={require('../../assets/images/crow.png')}
        />
        <LoadingText>as the CROW flies</LoadingText>
      </Container>
    );
  }
}

export default class LoadingScreenContainer extends React.Component {
  render() {
    return (
      <AppContext.Consumer>
        {context => <LoadingScreen {...context} />}
      </AppContext.Consumer>
    );
  }
}

const Container = styled.View`
  width: 20%;
  height: 100%;
  align-items: center;
  justify-content: center;
  background: ${props => props.background};
`
const Crow = styled(Animated.Image)`
  width: 150px;
  height: 150px;
  resize-mode: contain;
  box-shadow: 0px 5px 5px rgba(0, 0, 0, 0.25);
`
const LoadingText = styled(CustomText)`
  font-size: 20px;
`