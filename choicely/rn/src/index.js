import React from 'react'
import {AppRegistry, ScrollView, LogBox, View} from 'react-native'
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context'
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import Toast from 'react-native-toast-message'

if (__DEV__) {
  LogBox.ignoreLogs(['Open debugger to view warnings'])
}

const defaultComponentName = 'hello'
export const componentMapping = {
  [defaultComponentName]: require('./components/Hello'),
  counter: require('./components/Counter'),
  tic_tac_toe: require('./components/TicTacToe'),
}

function RootShell({useSafeAreaProvider, children}) {
  const body = (
    <>
      {children}
      <Toast />
    </>
  )

  if (!useSafeAreaProvider) {
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        <View style={{flex: 1}}>{body}</View>
      </GestureHandlerRootView>
    )
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <SafeAreaView style={{flex: 1}}>{body}</SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

function createRootComponent(Comp, {useSafeAreaProvider, rootOptions = {}}) {
  const {disableScrollView} = rootOptions

  return function Root(props) {
    let content = <Comp {...props} />

    if (!disableScrollView) {
      content = (
        <ScrollView style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
          {content}
        </ScrollView>
      )
    }

    return <RootShell useSafeAreaProvider={useSafeAreaProvider}>{content}</RootShell>
  }
}

let _registered = false

export function registerComponents({useSafeAreaProvider = true} = {}) {
  if (_registered === true) return

  Object.entries(componentMapping).forEach(([name, compModule]) => {
    if (compModule == null) return
    const Comp = compModule.default
    const rootOptions = compModule.rootOptions ?? {}

    const RootComponent = createRootComponent(Comp, {useSafeAreaProvider, rootOptions})

    componentMapping[name] = {
      ...compModule,
      registeredComponent: RootComponent,
    }

    AppRegistry.registerComponent(name, () => RootComponent)
  })

  _registered = true
}

registerComponents()
export default defaultComponentName
