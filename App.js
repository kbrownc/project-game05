import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Keyboard,
  Button,
  TextInput,
} from 'react-native';

const numColumns = 8;
const numRows = 8;
const newBoard = [];
let i;
for (i = 0; i < (numColumns * numRows) + 1 ; i++) {
  if (i === 1) {
    newBoard[i] = {key: i+1, name: 'C'};
  } else if (i === 2) {
    newBoard[i] = {key: i+1, name: 'A'};
  } else if (i === 3) {
    newBoard[i] = {key: i+1, name: 'T'};
  } else {
    newBoard[i] = {key: i+1, name: ' '};
  }
};

export default function App() {
  const [
    {
      letter,
      message,
      score,
      board,
      endOfGame,
    },
    setGameState,
  ] = useState({
    letter: '',
    message: 'Enter 1st word',
    score: 0,
    board: JSON.parse(JSON.stringify(newBoard)),
    endOfGame: false,
  });

  // render board
  const renderBoard = ({ item }) => {
    return (
      <View style={styles.item}>
        <TouchableHighlight onPress={() => pressCell(item.key)} underlayColor='red'
            disabled={item.name === ' ' ? false : true}>
            <Text style={styles.itemText}>{item.name}</Text>
        </TouchableHighlight>
      </View>
    );
  };

  // Count the no. of words on board
  const countBoard = () => {
    let wordCount = 0;
    // Count words on rows
    let i;
    for (i = 0; i < (numColumns - 3) ; i++) {
      if (board[i].name !== ' ' &&
        board[i + 1].name !== ' ' &&
        board[i + 2].name !== ' ') {
      wordCount = wordCount + 1;
      }
    }
    return (wordCount);
  };

  // Select a cell on the board
  const pressCell = useCallback((key) => {
    setGameState(prevGameState => {
      let workBoard = prevGameState.board.slice();
      let workLetter = prevGameState.letter;
      let workMessage = 'Pressed a cell';
      if (letter !== '') {
        workBoard[key - 1].name = letter;
        workLetter = '';
      }
      return {
        ...prevGameState,
        letter: workLetter,
        message: workMessage,
        board: workBoard,
      };
    });
  }, [letter]);

  // press Reset button
  const pressReset = useCallback(() => {
    setGameState(prevGameState => {
      return {
        letter: '',
        message: 'Reset Pressed',
        score: 0,
        board: JSON.parse(JSON.stringify(newBoard)),
        endOfGame: false,
      };
    });
  }, []);

  // enter a Letter from keyboard
  const enterLetter = useCallback((val) => {
    setGameState(prevGameState => {
      let workLetter = prevGameState.letter;
      let workMessage = '';
      if (letter === '') {
        workLetter = val;
        workMessage = 'letter entered';
      }
      return {
        ...prevGameState,
        letter: workLetter,
        message: workMessage,
      };
    });
  }, [letter]);

  // press DONE entering the letters button
  //    Need to validate entry of letters (spelling and duplicates)
  //    Neeed to check if we are at end of game
  //    Need to update score
  const pressDone = useCallback(() => {
    setGameState(prevGameState => {
      let workBoard = prevGameState.board.slice();
      let workMessage = 'Done button';
      let workEndOfGame = false;
      // Check for end of Game
      if (endOfGame) {
        workMessage = 'Game Complete';
      }
      return {
        ...prevGameState,
        message: workMessage,
        score: countBoard(),
        board: workBoard,
        endOfGame: workEndOfGame,
      };
    });
  }, []);

  // render
  return (
    <TouchableWithoutFeedback onPress={ () => {Keyboard.dismiss()}}>
    <View style={styles.container}>
      <View style={styles.nav}>
        <Button
          onPress={pressReset}
          title="Reset"
          color="blue"
        />
        <View style={endOfGame ? styles.itemInvisible : null}>
          <Button
            onPress={pressDone}
            title="Done"
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
      <View style={styles.nav}>
        <TextInput style={styles.input} 
          onChangeText={(val) => enterLetter(val)} 
          autoCapitalze="characters"
          maxLength={1}
        />
      <Text>Enter Letter</Text>
      </View>
      <View style={styles.board}>
        <FlatList data={board} renderItem={renderBoard} style={styles.board} numColumns={numColumns} />
      </View>
    </View>
    </TouchableWithoutFeedback>
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
  board: {
    flex: 7,
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 1,
  },
});
