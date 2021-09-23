import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableHighlight,
  Button,
  Image,
  TextInput,
} from 'react-native';
import { newBoard } from './newboard.js';

const numColumns = 8;

export default function App() {
  const [
    {
      letter1,
      letter2,
      message,
      score,
      board,
      endOfGame,
    },
    setGameState,
  ] = useState({
    letter1: 'Q',
    letter2: '',
    message: 'Enter 1st word',
    score: 0,
    board: JSON.parse(JSON.stringify(newBoard)),
    endOfGame: false,
  });
  const [letter, setLetter] = useState('');

  // render board
  const renderBoard = ({ item }) => {
    if (item.key === 35) {
    item.name = letter;
  }
  if (item.key === 37) {
    item.name = letter1;
  }
    if (item.name === 'D') {
      return <Text style={styles.itemAbout}>{item.aboutText}</Text>;
    } else  {
      return (
        <View style={styles.item}>
          <Text style={styles.itemText}>{item.name}</Text>
        </View>
      );
    }
  };

  // press Reset button
  const pressReset = useCallback(() => {
    setGameState(prevGameState => {
      return {
        letter1: '',
        letter2: '',
        message: 'Play',
        score: 0,
        board: JSON.parse(JSON.stringify(newBoard)),
        endOfGame: false,
      };
    });
  }, []);

  // enter Letter button
  const enterLetter = useCallback((val) => {
    setGameState(prevGameState => {
      let workMessage = 'letter entered';
      let workLetter1 = val;
      return {
        ...prevGameState,
        letter1: workLetter1,
        message: workMessage,
      };
    });
  }, [letter1]);

  // press PLAY button
  const pressPlay = useCallback(() => {
    setGameState(prevGameState => {
      let workBoard = prevGameState.board.slice();
      let workLetter1 = 'W';
      let workLetter2 = 'X';
      let workMessage = 'Play button';
      let workEndOfGame = false;
      let scoreAdj = 1;
      // Check for end of Game
      if (endOfGame) {
        workMessage = 'Game Complete';
      }
      return {
        letter1: '',
        letter2: '',
        message: workMessage,
        score: prevGameState.score + scoreAdj,
        board: workBoard,
        endOfGame: workEndOfGame,
      };
    });
  }, []);

  // render
  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        <Button
          onPress={pressReset}
          title="Reset"
          color="blue"
        />
        <View style={endOfGame ? styles.itemInvisible : null}>
          <Button
            onPress={pressPlay}
            title="Play"
            color="blue"
            disabled={endOfGame ? true : false}
          />
        </View>
        <View style={styles.itemNav}>
          <Text style={styles.itemText}>Score</Text>
        </View>
        <View style={styles.itemNav}>
          <Text style={styles.itemText}>{score}</Text>
        </View>
      </View>
      <View style={styles.message}>
        <View style={styles.messageRow}>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
      <TextInput style={styles.input} 
        onChangeText={(val) => setLetter(val)} 
        maxLength={1}
      />
      <TextInput style={styles.input} 
        onChangeText={(val) => enterLetter(val)} 
        maxLength={1}
      />
      <View style={styles.board}>
        <FlatList data={board} renderItem={renderBoard} style={styles.board} numColumns={numColumns} />
      </View>
    </View>
  );
}

// stylesheets
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 55,
  },
  nav: {
    flex: 0,
    fontWeight: 'bold',
    flexDirection: 'row',
  },
  input: {
    width: 50,
    borderColor: 'gray',
    borderWidth: 5,
    borderRadius: 10,
    padding: 2,
    fontSize: 20,
  },
  item: {
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: 1,
    height: Dimensions.get('window').width / 8,
  },
  itemNav: {
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: 1,
    height: 45,
  },
  itemText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  message: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  messageRow: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  messageRow2: {
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'yellow',
  },
  board: {
    flex: 7,
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 1,
  },
});
