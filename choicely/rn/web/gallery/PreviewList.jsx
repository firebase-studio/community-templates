import React from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'

function afterScheme(uri) {
  const i = uri.indexOf(':')
  const rest = i === -1 ? uri : uri.slice(i + 1)
  return rest.replace(/^\/+/, '')
}

function canUseAsyncClipboard() {
  try {
    const pp = document?.permissionsPolicy || document?.featurePolicy
    if (pp?.allowsFeature && !pp.allowsFeature('clipboard-write')) return false
  } catch (_) {}
  return typeof navigator !== 'undefined' && !!navigator.clipboard?.writeText
}

function copyViaExecCommand(text) {
  if (typeof document === 'undefined') return false

  try {
    window?.focus?.()
    document.body?.focus?.()
  } catch (_) {}

  const el = document.createElement('textarea')
  el.value = text
  el.setAttribute('readonly', '')
  el.style.position = 'fixed'
  el.style.top = '0'
  el.style.left = '-9999px'
  el.style.opacity = '0'
  el.style.userSelect = 'text'
  el.style.webkitUserSelect = 'text'

  document.body.appendChild(el)

  el.focus()
  el.select()
  el.setSelectionRange(0, text.length)

  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch (_) {
    ok = false
  }

  document.body.removeChild(el)
  return ok
}

async function copyToClipboard(text) {
  const okSync = copyViaExecCommand(text)
  if (okSync) return true
  if (canUseAsyncClipboard()) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (e) {
    }
  }
  try {
    window?.prompt('Copy this:', text)
  } catch (_) {}
  return false
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

function CopyIcon({ size = 15 }) {
  return (
    <Svg
      viewBox="0 0 488.3 488.3"
      width={size}
      height={size}
      style={styles.copyIconSvg}
      color="currentColor"
    >
      <Path
        fill="currentColor"
        d="M314.25 85.4h-227c-21.3 0-38.6 17.3-38.6 38.6v325.7c0 21.3 17.3 38.6 38.6 38.6h227c21.3 0 38.6-17.3 38.6-38.6V124c-.1-21.3-17.4-38.6-38.6-38.6m11.5 364.2c0 6.4-5.2 11.6-11.6 11.6h-227c-6.4 0-11.6-5.2-11.6-11.6V124c0-6.4 5.2-11.6 11.6-11.6h227c6.4 0 11.6 5.2 11.6 11.6z"
      />
      <Path
        fill="currentColor"
        d="M401.05 0h-227c-21.3 0-38.6 17.3-38.6 38.6 0 7.5 6 13.5 13.5 13.5s13.5-6 13.5-13.5c0-6.4 5.2-11.6 11.6-11.6h227c6.4 0 11.6 5.2 11.6 11.6v325.7c0 6.4-5.2 11.6-11.6 11.6-7.5 0-13.5 6-13.5 13.5s6 13.5 13.5 13.5c21.3 0 38.6-17.3 38.6-38.6V38.6c0-21.3-17.3-38.6-38.6-38.6"
      />
    </Svg>
  )
}

function CopyFooter({ name, toCopy, variant = 'list' }) {
  const [tip, setTip] = React.useState(null)
  const tipTimer = React.useRef(null)

  const clearTipTimer = React.useCallback(() => {
    if (tipTimer.current) {
      clearTimeout(tipTimer.current)
      tipTimer.current = null
    }
  }, [])

  React.useEffect(() => () => clearTipTimer(), [clearTipTimer])

  const showCopied = React.useCallback(() => {
    clearTipTimer()
    setTip('Copied')
    tipTimer.current = setTimeout(() => setTip(null), 1100)
  }, [clearTipTimer])

  const onCopy = React.useCallback(async () => {
    const ok = await copyToClipboard(toCopy)
    if (ok) showCopied()
    else setTip('Copy')
  }, [toCopy, showCopied])

  const showFull = variant === 'popup'

  const linkTextStyle = showFull ? styles.previewLinkTextPopup : styles.previewLinkTextList
  const nameTextStyle = showFull ? styles.previewLinkNamePopup : styles.previewLinkNameList

  return (
    <Pressable
      onPress={(e) => {
        if (e && e.stopPropagation) e.stopPropagation()
        void onCopy()
      }}
      onHoverIn={() => {
        clearTipTimer()
      }}
      onHoverOut={() => {
        clearTipTimer()
        setTip(null)
      }}
      accessibilityRole="button"
      style={({ pressed, hovered }) => [
        styles.previewFooterButton,
        pressed && styles.previewFooterButtonPressed,
        hovered && styles.previewFooterButtonHovered,
      ]}
    >
      {({ hovered, pressed }) => {
        const tipText = tip === 'Copied' ? 'Copied' : hovered ? 'Copy' : null

        return (
          <View style={styles.footerRow}>
            <View style={styles.footerTextRow}>
              <Text style={linkTextStyle} numberOfLines={1}>
                {showFull ? (
                  <>
                    {'choicely://special/rn/'}
                    <Text style={nameTextStyle}>{name}</Text>
                  </>
                ) : (
                  <Text style={nameTextStyle}>{name}</Text>
                )}
              </Text>

              <View
                style={[
                  styles.copyIconWrap,
                  (hovered || pressed || tip === 'Copied') && styles.copyIconWrapVisible,
                ]}
                pointerEvents="none"
              >
                <CopyIcon size={15} />
              </View>
            </View>

            {tipText ? (
              <View
                pointerEvents="none"
                style={[styles.tooltip, tipText === 'Copied' && styles.tooltipCopied]}
              >
                <Text style={styles.tooltipText}>{tipText}</Text>
              </View>
            ) : null}
          </View>
        )
      }}
    </Pressable>
  )
}


function Popup({ open, name, components, queryProps, onClose }) {
  React.useEffect(() => {
    if (!open) return
    if (typeof window === 'undefined') return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const Comp = name ? components[name]?.registeredComponent : null
  const uri = name ? `choicely://special/rn/${name}` : ''
  const toCopy = afterScheme(uri)

  const isWeb = typeof document !== 'undefined'

  const Card = (
    <Pressable
      style={styles.modalCenter}
      onPress={(e) => e?.stopPropagation?.()}
      onPressIn={(e) => e?.stopPropagation?.()}
      onStartShouldSetResponder={() => true}
      onResponderGrant={(e) => e?.stopPropagation?.()}
    >
      <View style={styles.modalCard}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle} numberOfLines={1}>
            {name}
          </Text>

          <Pressable
            onPress={(e) => {
              e?.stopPropagation?.()
              onClose()
            }}
            onPressIn={(e) => e?.stopPropagation?.()}
            accessibilityRole="button"
            style={({ pressed, hovered }) => [
              styles.modalCloseBtn,
              pressed && styles.modalCloseBtnPressed,
              hovered && styles.modalCloseBtnHovered,
            ]}
          >
            <Text style={styles.modalCloseText}>×</Text>
          </Pressable>
        </View>

        <View style={styles.modalFrame}>
          <View style={styles.modalComponentHost}>
            {Comp ? (
              <Comp {...queryProps} />
            ) : (
              <MessageScreen text={`Component "${String(name)}" not found`} />
            )}
          </View>
        </View>

        <View
          style={styles.previewFooter}
          onStartShouldSetResponder={() => true}
          onResponderGrant={(e) => e?.stopPropagation?.()}
        >
          <CopyFooter name={name} toCopy={toCopy} variant="popup" />
        </View>
      </View>
    </Pressable>
  )

  if (isWeb) {
    return (
      <View
        style={[
          styles.modalBackdrop,
          {
            position: 'fixed',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 999999,
          },
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          aria-label="Close"
        />
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 18,
          }}
          pointerEvents="box-none"
        >
          {Card}
        </View>
      </View>
    )
  }
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        {Card}
      </Pressable>
    </Modal>
  )
}

function PreviewList({ names, components, queryProps }) {
  const [openName, setOpenName] = React.useState(null)

  return (
    <>
      <ScrollView style={styles.previewList} contentContainerStyle={styles.previewListContent}>
        {names.map((name) => {
          const Comp = components[name]?.registeredComponent
          const uri = `choicely://special/rn/${name}`
          const toCopy = afterScheme(uri)

          return (
            <View key={name} style={styles.previewItem}>
              {/* Clickable card */}
              <Pressable
                onPress={() => setOpenName(name)}
                style={({ pressed, hovered }) => [
                  styles.previewItemPressable,
                  (pressed || hovered) && styles.previewItemPressableActive,
                ]}
              >
                {/* Layout box: takes the scaled height/width in the list flow */}
                <View style={[styles.previewItemScaledWrap, { aspectRatio: 9 / 20 }]}>
                  {/* Visual box: scaled "zoom" */}
                  <View style={styles.previewItemScaled}>
                    <View style={styles.previewCard}>
                      <View style={styles.previewFrame}>
                        {/* NON-interactive in the grid to avoid broken tiny interactions */}
                        <View pointerEvents="none" style={styles.componentHost}>
                          {Comp ? (
                            <Comp {...queryProps} />
                          ) : (
                            <MessageScreen text={`Component "${String(name)}" not found`} />
                          )}
                        </View>
                      </View>

                      <View style={styles.previewFooter}>
                        <CopyFooter name={name} toCopy={toCopy} variant="list" />
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            </View>
          )
        })}
      </ScrollView>

      <Popup
        open={!!openName}
        name={openName}
        components={components}
        queryProps={queryProps}
        onClose={() => setOpenName(null)}
      />
    </>
  )
}

export function WebRootPreviewList({ names, components, queryProps = {} }) {
  return <PreviewList names={names} components={components} queryProps={queryProps} />
}

const ITEMS_PER_ROW = 2
const SCALE = 1 / ITEMS_PER_ROW
const GUTTER = 12

const styles = StyleSheet.create({
  previewList: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewListContent: {
    padding: 12,
    paddingBottom: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },

  previewItem: {
    width: `${100 / ITEMS_PER_ROW}%`,
    paddingHorizontal: GUTTER / 2,
    paddingVertical: 4,
  },

  previewItemPressable: {
    width: '100%',
    borderRadius: 16,
  },
  previewItemPressableActive: {
    transform: [{ scale: 0.995 }],
  },

  previewItemScaledWrap: {
    width: '100%',
    overflow: 'visible',
  },

  previewItemScaled: {
    width: `${100 / SCALE}%`,
    transform: [{ scale: SCALE }],
    transformOrigin: 'top left',
  },

  previewCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },

  previewFrame: {
    width: '100%',
    aspectRatio: 9 / 18,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },

  componentHost: {
    flex: 1,
    backgroundColor: '#fff',
  },

  previewFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e6e6e6',
    backgroundColor: '#37ff95',
  },

  previewFooterButton: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    cursor: 'pointer',
  },
  previewFooterButtonHovered: {
    backgroundColor: '#f5f5f5',
  },
  previewFooterButtonPressed: {
    backgroundColor: '#f0f0f0',
  },

  footerRow: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  footerTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },

  previewLinkText: {
    fontSize: 12,
    color: '#111',
    opacity: 0.85,
    textAlign: 'center',
    fontWeight: '600',
  },

  previewLinkName: {
    fontWeight: '800',
  },

  copyIconWrap: {
    marginLeft: 8,
    opacity: 0.85,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyIconWrapVisible: {
    opacity: 0.85,
  },

  copyIconSvg: {
    verticalAlign: 'middle',
  },

  tooltip: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: '#111',
    opacity: 0.92,
    zIndex: 10,
    alignSelf: 'center',
  },
  tooltipCopied: {
    backgroundColor: '#111',
  },
  tooltipText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },

  messageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111',
    flex: 1,
    paddingRight: 10,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  modalCloseBtnHovered: {
    backgroundColor: '#f3f3f3',
  },
  modalCloseBtnPressed: {
    backgroundColor: '#ececec',
  },
  modalCloseText: {
    fontSize: 22,
    lineHeight: 22,
    fontWeight: '800',
    color: '#111',
    marginTop: -1,
  },

  modalFrame: {
    width: '100%',
    aspectRatio: 9 / 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  modalComponentHost: {
    flex: 1,
    backgroundColor: '#fff',
  },
  previewLinkTextList: {
    fontSize: 28,
    color: '#111',
    opacity: 0.9,
    textAlign: 'center',
    fontWeight: '700',
  },
  previewLinkNameList: {
    fontWeight: '900',
  },

  previewLinkTextPopup: {
    fontSize: 12,
    color: '#111',
    opacity: 0.85,
    textAlign: 'center',
    fontWeight: '600',
  },
  previewLinkNamePopup: {
    fontWeight: '800',
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalCenter: {
    width: '100%',
    maxWidth: 980,
    maxHeight: '90vh',
  },
  modalCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: '#fff',
    maxHeight: '90vh',
  },
})
