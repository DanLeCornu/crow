import * as TaskManager from 'expo-task-manager';
import { BACKGROUND_LOCATION_TASK, } from '../lib/constants'
import { storeData } from '../services/localStorage'

export const defineBackgroundTask = () => {
  TaskManager.defineTask(BACKGROUND_LOCATION_TASK, ({ data, error }) => {
    if (error) {
      console.log(error.message);
    }
    if (data) {
      const { locations } = data
      const location = [locations[0].coords.latitude, locations[0].coords.longitude];
      storeData('location', location)
    }
  })
}