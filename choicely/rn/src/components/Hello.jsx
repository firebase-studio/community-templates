import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

export default function Hello({message = 'Choicely'}) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello from {message}!</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
  },
})
