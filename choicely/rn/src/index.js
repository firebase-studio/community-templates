import React from 'react'
import {AppRegistry, ScrollView, LogBox, View, Text} from 'react-native'
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context'
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import Toast from 'react-native-toast-message'

if (__DEV__) {
  LogBox.ignoreLogs(['Open debugger to view warnings'])
}

const defaultComponentName = 'hello'
export const componentMapping = {
  [defaultComponentName]: () => require('./components/Hello'),
  counter: () => require('./components/Counter'),
  tic_tac_toe: () => require('./components/TicTacToe'),
}

function ErrorScreen({name, error, stage}) {
  const message = error?.message || 'Unknown error'
  const hint = stage === 'load' ? 'module load failed' : 'render failed'

  return (
    <View style={{flex: 1, padding: 24, justifyContent: 'center'}}>
      <Text style={{fontSize: 22, fontWeight: '600', marginBottom: 12}}>
        Component error
      </Text>
      <Text style={{fontSize: 16, marginBottom: 8}}>Name: {name}</Text>
      <Text style={{fontSize: 16, marginBottom: 8}}>Stage: {hint}</Text>
      <Text style={{fontSize: 14}}>{message}</Text>
    </View>
  )
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {hasError: false, error: null}
  }

  static getDerivedStateFromError(error) {
    return {hasError: true, error}
  }

  componentDidCatch(error, info) {
    if (__DEV__) {
      console.warn('RN component render error:', error, info)
    }
  }

  render() {
    const {hasError, error} = this.state
    const {children, name} = this.props

    if (hasError) {
      return <ErrorScreen name={name} error={error} stage="render" />
    }

    return children
  }
}

function safeLoadModule(name, loader) {
  try {
    if (typeof loader !== 'function') {
      return {error: new Error('Component loader is not a function')}
    }
    return {module: loader()}
  } catch (error) {
    return {error}
  }
}

function createSafeComponent(name, loader) {
  const {module, error} = safeLoadModule(name, loader)

  if (!module || error) {
    return function LoadError() {
      return <ErrorScreen name={name} error={error} stage="load" />
    }
  }

  const Comp = module.default

  if (!Comp) {
    return function MissingDefaultExport() {
      return (
        <ErrorScreen
          name={name}
          error={new Error('Component has no default export')}
          stage="load"
        />
      )
    }
  }

  return function SafeComponent(props) {
    return (
      <ErrorBoundary name={name}>
        <Comp {...props} />
      </ErrorBoundary>
    )
  }
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

  Object.entries(componentMapping).forEach(([name, loader]) => {
    if (loader == null) return
    const SafeComp = createSafeComponent(name, loader)
    const {module} = safeLoadModule(name, loader)
    const rootOptions = module?.rootOptions ?? {}

    const RootComponent = createRootComponent(SafeComp, {useSafeAreaProvider, rootOptions})

    componentMapping[name] = {
      loader,
      registeredComponent: RootComponent,
    }

    AppRegistry.registerComponent(name, () => RootComponent)
  })

  _registered = true
}

registerComponents()
export default defaultComponentName
