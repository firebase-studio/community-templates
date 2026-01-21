import React from 'react'
import {AppRegistry, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native'
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context'

import {componentMapping, defaultComponentName, registerComponents} from '../src/index'

registerComponents({useSafeAreaProvider: false})

if (typeof document === 'undefined' || document.documentElement == null) {
  throw new Error('Document is undefined. This file should be run in a web environment.')
}

const rootTag = document.getElementById('root')

if (rootTag == null) {
  throw new Error(
    'Root tag not found. Please ensure there is a <div id="root"></div> in your HTML file.',
  )
}

document.documentElement.style.height = '100%'
document.body.style.height = '100%'
document.body.style.margin = '0'
rootTag.style.height = '100%'
rootTag.style.display = 'flex'
rootTag.style.flexDirection = 'column'

const HIGHLIGHT = '#37ff95'

function getQueryState() {
  if (typeof window === 'undefined') {
    return {forcedComponentName: null, queryProps: {}}
  }
  const params = new URLSearchParams(window.location.search)
  const queryProps = {}
  for (const [key, value] of params.entries()) {
    queryProps[key] = value
  }
  const forcedComponentName =
    params.get('_component') ?? params.get('component') ?? null
  return { forcedComponentName, queryProps }
}

const {forcedComponentName, queryProps} = getQueryState()

function RootSafeArea({children}) {
  return (
    <SafeAreaProvider style={styles.safeAreaProvider}>
      <SafeAreaView style={styles.safeArea}>
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

function MessageScreen({text}) {
  return (
    <ScrollView contentContainerStyle={{flexGrow: 1}}>
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{text}</Text>
      </View>
    </ScrollView>
  )
}

export function TopBar({names, active, onSelect}) {
  return (
    <View style={styles.topBar}>
      {names.map((name) => {
        const selected = name === active
        return (
          <Pressable
            key={name}
            onPress={() => onSelect(name)}
            style={({pressed}) => [
              styles.chipBase,
              selected ? styles.chipSelected : styles.chipUnselected,
              !selected && pressed && styles.chipPressed,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                selected && styles.chipTextSelected,
              ]}
            >
              {name}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

function WebRoot({
  components = {},
  initialComponent,
  forcedComponentName,
  queryProps = {},
}) {
  const names = Object.keys(components)

  if (names.length === 0) {
    return (
      <RootSafeArea>
        <MessageScreen text={`No components found`} />
      </RootSafeArea>
    )
  }

  if (forcedComponentName) {
    const ForcedComponent = components[forcedComponentName]?.registeredComponent
    return (
      <RootSafeArea>
        {ForcedComponent ? (
          <ForcedComponent {...queryProps} />
        ) : (
          <MessageScreen text={`Component "${String(forcedComponentName)}" not found`} />
        )}
      </RootSafeArea>
    )
  }

  const initial =
    initialComponent && names.includes(initialComponent) ? initialComponent : names[0]
  const [active, setActive] = React.useState(initial)
  const Active = active ? components[active]?.registeredComponent : undefined
  return (
    <RootSafeArea>
      <View style={styles.webRootContainer}>
        <TopBar names={names} active={active} onSelect={setActive} />
        {Active ? (
          <Active {...queryProps} />
        ) : (
          <MessageScreen text={`Component "${String(active)}" not found`} />
        )}
      </View>
    </RootSafeArea>
  )
}

const styles = StyleSheet.create({
  safeAreaProvider: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  webRootContainer: {
    flex: 1,
  },
  topBar: {
    backgroundColor: '#0f0f0f',
    borderBottomWidth: 1,
    borderColor: '#232323',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  chipBase: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    borderColor: HIGHLIGHT,
    backgroundColor: 'rgba(55, 255, 149, 0.14)',
  },
  chipUnselected: {
    borderColor: '#2a2a2a',
    backgroundColor: 'transparent',
  },
  chipPressed: {
    backgroundColor: '#1a1a1a',
  },
  chipText: {
    color: '#e5e5e5',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: HIGHLIGHT,
    fontWeight: '600',
  },
  messageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 16,
  },
})

const WEB_APP_NAME = 'web_root'
AppRegistry.registerComponent(WEB_APP_NAME, () => WebRoot)
AppRegistry.runApplication(WEB_APP_NAME, {
  rootTag,
  initialProps: {
    components: componentMapping,
    initialComponent: defaultComponentName,
    forcedComponentName,
    queryProps,
  },
})
