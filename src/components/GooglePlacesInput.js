import React from 'react'
import { Keyboard } from 'react-native'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { GOOGLE_API_KEY } from '../lib/api_keys'

import styled from 'styled-components'

export class GooglePlacesInput extends React.Component {
  // required to ensure listView is hidden onPress
  shouldComponentUpdate() {
    return false
  }

  render() {
    return (
      <GooglePlacesAutocomplete
        placeholder='Take me to ...'
        minLength={2}
        autoFocus={false}
        returnKeyType={'search'}
        fetchDetails={true}
        renderDescription={row => row.description}
        debounce={200}
        renderLeftButton={() => <SearchIcon source={require('../../assets/images/search.png')} />}
        onPress={(data, details = null) => {
          const lat = details.geometry.location.lat
          const lon = details.geometry.location.lng
          this.props.setDestination(lat, lon)
        }}
        query={{
          key: GOOGLE_API_KEY,
          language: 'en',
        }}
        styles={{
          container: {
            zIndex: 1,
          },
          textInputContainer: {
            width: '95%',
            height: 50,
            backgroundColor: "white",
            borderRadius: 5,
            borderTopWidth: 0,
            borderBottomWidth: 0,
            marginLeft: "2.5%",
            marginTop: 10,
            shadowOffset: { width: 0, height: 5 },
            shadowRadius: 5,
            shadowOpacity: 0.25,
          },
          textInput: {
            height: 35,
            paddingLeft: 4,
            color: 'grey'
          },
          description: {
            fontWeight: 'bold'
          },
          poweredContainer: {
            display: "none"
          },
          listView: {
            position: 'absolute',
            zIndex: 1,
            top: 50,
            backgroundColor: 'white',
            width: '95%',
            marginLeft: "2.5%",
            borderRadius: 5,
          },
          row: {
            width: '95%',
          },
          description: {
            color: "grey"
          }
        }}
      />
    )
  }
}
const SearchIcon = styled.Image`
  height: 25px;
  width: 25px;
  margin-top: 13px;
  margin-left: 12px;
`