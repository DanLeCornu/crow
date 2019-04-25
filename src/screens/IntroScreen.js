import React from 'react';
import { View } from 'react-native';
import { CustomText } from '../components/CustomText'
import styled from 'styled-components';
import AppContext from '../AppContext';

class IntroScreen extends React.Component {
  render() {
    const {theme, moveTo} = this.props;
    return (
      <>
        <Container background={theme}>
          <View>
            <CustomText>
              this is intro page 1
            </CustomText>
            <CustomText onPress={() => moveTo('right')}>
              next page
            </CustomText>
          </View>
        </Container>
        <Container background={theme}>
          <View>
            <CustomText>
              this is intro page 2
            </CustomText>
            <CustomText onPress={() => moveTo('right')}>
              next page
            </CustomText>
          </View>
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
`