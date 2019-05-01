import React, { PureComponent } from 'react';
import { TouchableHighlight } from 'react-native'
import { CustomText } from './CustomText'
import styled from 'styled-components';

export default class Button extends PureComponent {
  render() {
    const {
      text,
      onPress,
		} = this.props
    return (
      <CustomButton onPress={onPress}>
        <ButtonText>{text}</ButtonText>
      </CustomButton>
    )
  }
}

const CustomButton = styled(TouchableHighlight)`
  width: 55%;
  height: 45px;
  background: #333333;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
`
const ButtonText = styled(CustomText)`
  color: white;
  font-size: 18px;
`