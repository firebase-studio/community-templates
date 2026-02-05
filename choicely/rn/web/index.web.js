import React from 'react'
import { AppRegistry, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

import {
  componentMapping,
  defaultComponentName,
  registerComponents,
} from '../src/index'

import { WebRootChips } from './gallery/Chips'
import { WebRootPreviewList } from './gallery/PreviewList'

registerComponents({ useSafeAreaProvider: false })

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

const GALLERY_MODES = new Set(['chips', 'preview_list'])

function getQueryState() {
  if (typeof window === 'undefined') {
    return { forcedComponentName: null, queryProps: {}, galleryMode: 'chips' }
  }

  const params = new URLSearchParams(window.location.search)

  const queryProps = {}
  for (const [key, value] of params.entries()) {
    queryProps[key] = value
  }

  const forcedComponentName = params.get('_component') ?? params.get('component') ?? null

  const rawMode = params.get('_gallery_mode') ?? ''
  const galleryMode = GALLERY_MODES.has(rawMode) ? rawMode : 'chips'

  return { forcedComponentName, queryProps, galleryMode }
}

const { forcedComponentName, queryProps, galleryMode } = getQueryState()

function RootSafeArea({ children }) {
  return (
    <SafeAreaProvider style={styles.safeAreaProvider}>
      <SafeAreaView style={styles.safeArea}>{children}</SafeAreaView>
    </SafeAreaProvider>
  )
}

function MessageScreen({ text }) {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{text}</Text>
      </View>
    </ScrollView>
  )
}

function WebRoot({
  components = {},
  initialComponent,
  forcedComponentName,
  queryProps = {},
  galleryMode = 'chips',
}) {
  const names = Object.keys(components)

  if (names.length === 0) {
    return (
      <RootSafeArea>
        <MessageScreen text="No components found" />
      </RootSafeArea>
    )
  }

  // forced component always wins, regardless of gallery mode
  if (forcedComponentName) {
    const ForcedComponent = components[forcedComponentName]?.registeredComponent
    return (
      <RootSafeArea>
        {ForcedComponent ? (
          <View style={styles.componentHost}>
            <ForcedComponent {...queryProps} />
          </View>
        ) : (
          <MessageScreen text={`Component "${String(forcedComponentName)}" not found`} />
        )}
      </RootSafeArea>
    )
  }

  if (galleryMode === 'preview_list') {
    return (
      <RootSafeArea>
        <View style={styles.webRootContainer}>
          <WebRootPreviewList
            names={names}
            components={components}
            queryProps={queryProps}
          />
        </View>
      </RootSafeArea>
    )
  }

  return (
    <RootSafeArea>
      <View style={styles.webRootContainer}>
        <WebRootChips
          names={names}
          components={components}
          initialComponent={initialComponent}
          queryProps={queryProps}
          componentHostStyle={styles.componentHost}
        />
      </View>
    </RootSafeArea>
  )
}

const styles = StyleSheet.create({
  safeAreaProvider: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#fff' },

  webRootContainer: { flex: 1, backgroundColor: '#fff' },

  // shared host that forces a white background behind any component
  componentHost: { flex: 1, backgroundColor: '#fff' },

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
    galleryMode,
  },
})
