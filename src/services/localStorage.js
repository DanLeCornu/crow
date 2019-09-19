import { AsyncStorage } from 'react-native'

export const storeData = async (k,v) => {
  try {
    await AsyncStorage.setItem(k,v)
  } catch (e) {
    console.log(e.message);
  }
}

export const retrieveData = async (k) => {
  try {
    const value = await AsyncStorage.getItem(k)
    if (value !== null) {
      return value
    }
  } catch (e) {
    console.log(e.message);
  }
}