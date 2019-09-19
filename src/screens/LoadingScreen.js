import React from 'react';
import { Animated, Easing, Alert, Linking} from 'react-native';
import { CustomText } from '../components/CustomText'
import styled from 'styled-components';
import AppContext from '../AppContext';

import { GRANTED, DENIED, GRANTED_IN_USE } from '../lib/constants'

class LoadingScreen extends React.Component {
  state = {
    crowPosition: new Animated.Value(0),
    animationComplete: false,
  }

  componentDidMount() {
    this.bounceCrow()
    const interval = setInterval(async () => {
      if (this.state.animationComplete) {
        await this.props.askLocationPermission()
        if (this.props.permissionStatus == GRANTED || this.props.permissionStatus == GRANTED_IN_USE) {
          if (!this.props.subscribedToForegroundLocation) {
            await this.props.subscribeToForegroundLocation()
          }
          if (this.props.location) {
            await this.props.setSkipIntro()
            this.props.moveTo('right')
            clearInterval(interval)
          }
        } else if (!this.props.permissionAlert) {
          Alert.alert(
            'Location Permissions',
            'Hey! We need your permission to access your location, in order for the Crow app to work. Please go to your app settings and select "Always" for location :)',
            [
              {
                text: 'OK, will do!',
                onPress: () => {
                  Linking.openURL('app-settings:')
                  setTimeout(async () => {
                    await this.props.askLocationPermission()
                    if (this.props.permissionStatus == DENIED) {
                      this.props.setPermissionAlert(false)
                    }
                  }, 100);
                }
              },
            ],
            { cancelable: false }
          )
          this.props.setPermissionAlert(true)
        }
      }
    }, 500);
  }

  bounceCrow = () => {
    setTimeout(() => {
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
        {iterations: 1}
      ).start();
      setTimeout(() => {
        this.setState({ animationComplete: true })
      }, 1000);
    }, 500);
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