import React, {useEffect, useRef, useState} from 'react'
import {Animated, Easing, Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

const COLORS = {
  background: '#F0F4F8',
  board: '#D9E2EC',
  cell: '#FFFFFF',
  x: '#5E81AC',
  o: '#BF616A',
  text: '#4C566A',
  button: '#88C0D0',
  buttonText: '#FFFFFF',
  winningLine: '#A3BE8C',
}

const CELL_SIZE = 80
const BOARD_PADDING = 10

const Mark = ({type, visible}) => {
  const scale = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      scale.setValue(0)
      opacity.setValue(0)
    }
  }, [visible])

  if (!visible) return null

  return (
    <Animated.Text
      style={[
        styles.markText,
        {color: type === 'X' ? COLORS.x : COLORS.o, transform: [{scale}], opacity},
      ]}>
      {type}
    </Animated.Text>
  )
}

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [winner, setWinner] = useState(null)

  const resultFade = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (winner) {
      Animated.timing(resultFade, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start()
    } else {
      resultFade.setValue(0)
    }
  }, [winner])

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  const handlePress = (index) => {
    if (board[index] || winner) return

    const newBoard = [...board]
    newBoard[index] = isXNext ? 'X' : 'O'
    setBoard(newBoard)

    const win = checkWinner(newBoard)
    if (win) {
      setWinner(win)
    } else if (!newBoard.includes(null)) {
      setWinner('Draw')
    } else {
      setIsXNext(!isXNext)
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setWinner(null)
  }

  const getStatusText = () => {
    if (winner === 'Draw') return 'It\'s a Draw!'
    if (winner) return `Winner: ${winner}`
    return `Player ${isXNext ? 'X' : 'O'}'s Turn`
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tic-Tac-Toe</Text>

      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, winner ? styles.winnerText : null]}>
          {getStatusText()}
        </Text>
      </View>

      <View style={styles.board}>
        {board.map((cell, index) => (
          <Pressable
            key={index}
            style={styles.cell}
            onPress={() => handlePress(index)}
            android_ripple={{color: '#EEE'}}>
            <Mark type={cell} visible={!!cell}/>
          </Pressable>
        ))}
      </View>

      <Animated.View style={{opacity: winner ? resultFade : 1}}>
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetButtonText}>
            {winner ? 'Play Again' : 'Reset Game'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    letterSpacing: 1,
  },
  statusContainer: {
    height: 40,
    marginBottom: 20,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: '600',
  },
  winnerText: {
    color: COLORS.winningLine,
    fontWeight: 'bold',
    fontSize: 24,
  },
  board: {
    width: CELL_SIZE * 3 + BOARD_PADDING * 4,
    height: CELL_SIZE * 3 + BOARD_PADDING * 4,
    backgroundColor: COLORS.board,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 15,
    padding: BOARD_PADDING,
    justifyContent: 'space-between',
    alignContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 30,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: COLORS.cell,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: COLORS.button,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  resetButtonText: {
    color: COLORS.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
})
