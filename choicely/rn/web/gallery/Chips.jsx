import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

const HIGHLIGHT = '#37ff95'

function MessageScreen({ text }) {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{text}</Text>
      </View>
    </ScrollView>
  )
}

export function TopBar({ names, active, onSelect }) {
  return (
    <View style={styles.topBar}>
      {names.map((name) => {
        const selected = name === active
        return (
          <Pressable
            key={name}
            onPress={() => onSelect(name)}
            style={({ pressed }) => [
              styles.chipBase,
              selected ? styles.chipSelected : styles.chipUnselected,
              !selected && pressed && styles.chipPressed,
            ]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {name}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export function WebRootChips({
  components,
  names,
  initialComponent,
  queryProps,
  componentHostStyle,
}) {
  const initial =
    initialComponent && names.includes(initialComponent) ? initialComponent : names[0]

  const [active, setActive] = React.useState(initial)
  const Active = active ? components[active]?.registeredComponent : undefined

  return (
    <>
      <TopBar names={names} active={active} onSelect={setActive} />
      {Active ? (
        <View style={componentHostStyle ?? styles.componentHostFallback}>
          <Active {...(queryProps ?? {})} />
        </View>
      ) : (
        <MessageScreen text={`Component "${String(active)}" not found`} />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  componentHostFallback: {
    flex: 1,
    backgroundColor: '#fff',
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
