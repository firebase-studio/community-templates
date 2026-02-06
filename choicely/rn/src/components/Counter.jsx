import React, {useEffect, useState} from 'react'
import {Pressable, StyleSheet, Text, View} from 'react-native'
const {createMMKV} = require('react-native-mmkv')

const storage = createMMKV({id: 'counter'})

export default function Counter({start = "0"}) {
  start = Number(start) || 0
  const [count, setCount] = useState(() => {
    const storedCount = storage.getNumber('count')
    return storedCount === undefined ? start : storedCount
  })

  useEffect(() => {
    storage.set('count', count)
  }, [count])

  const resetCount = () => {
    setCount(start)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Count: {count}</Text>
      <Pressable style={styles.btn} onPress={() => setCount(n => n + 1)}>
        <Text style={styles.btnText}>Tap Me</Text>
      </Pressable>
      <Pressable style={[styles.btn, styles.resetBtn]} onPress={resetCount}>
        <Text style={styles.btnText}>Reset</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginBottom: 10,
  },
  resetBtn: {
    backgroundColor: '#ffdddd',
  },
  btnText: {
    fontSize: 16,
    userSelect: 'none',
  },
})
