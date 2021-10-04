import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Button,
  TextInput,
} from 'react-native';

const numColumns = 8;
const numRows = 8;

// This has not been incorporated yet
const wordLength = 3;
console.log('********', Date());

const newBoard = [];
let i;
for (i = 0; i < numColumns * numRows; i++) {
  newBoard[i] = { key: i + 1, name: '' };
}

export default function App() {
  const [{ message, score, board, endOfGame }, setGameState] = useState({
    message: 'Enter 1st word',
    score: 0,
    board: JSON.parse(JSON.stringify(newBoard)),
    endOfGame: false,
  });

  // render board
  const renderBoard = ({ item }) => {
    return (
      <View style={styles.item}>
        <TextInput
          style={styles.itemText}
          onChangeText={value => enterLetter(value, item.key)}
          autoCapitalze="characters"
          maxLength={1}
          value={item.name}
          editable={item.name === '' ? true : false}
        />
      </View>
    );
  };

  // press Reset button
  const pressReset = useCallback(() => {
    setGameState(prevGameState => {
      return {
        message: 'Reset Pressed',
        score: 0,
        board: JSON.parse(JSON.stringify(newBoard)),
        endOfGame: false,
      };
    });
  }, []);

  // enter a Letter from keyboard
  const enterLetter = useCallback((value, key) => {
    setGameState(prevGameState => {
      let workBoard = JSON.parse(JSON.stringify(prevGameState.board));
      let workMessage = 'Letter entered';
      workBoard[key - 1].name = value;
      return {
        ...prevGameState,
        message: workMessage,
        board: workBoard,
      };
    });
  }, []);

  // press DONE entering the letters button
  //    Need to validate entry of letters (spelling and duplicates)
  //    Neeed to check if we are at end of game
  //    Need to update score
  const pressDone = useCallback(() => {
    setGameState(prevGameState => {
      let workMessage = 'Done button';
      let workBoard = JSON.parse(JSON.stringify(prevGameState.board));
      let workEndOfGame = false;
      let wordList = {};
      let word = '';
      //  count the words on the board
      //  1) Count words on rows
      let i;
      let j;
      for (j = 0; j < numRows; j++) {
        for (i = j * numRows; i < (j + 1) * numColumns - 2; i++) {
          if (workBoard[i].name !== '' && workBoard[i + 1].name !== '' && workBoard[i + 2].name !== '') {
            word = workBoard[i].name + workBoard[i + 1].name + workBoard[i + 2].name;
            if (wordList[word] === undefined) {
              wordList[word] = 1;
            } else {
              workBoard[i].name = '';
              workBoard[i + 1].name = '';
              workBoard[i + 2].name = '';
              workMessage = 'Duplicate word - word rejected';
            }
          }
        }
      }
      //  2) Count words on columns
      for (j = 0; j < numColumns; j++) {
        for (i = 0; i < numRows - 2; i++) {
          if (
            workBoard[i * numColumns + j].name !== '' &&
            workBoard[i * numColumns + j + numRows].name !== '' &&
            workBoard[i * numColumns + j + numRows * 2].name !== ''
          ) {
            word =
              workBoard[i * numColumns + j].name +
              workBoard[i * numColumns + j + numRows].name +
              workBoard[i * numColumns + j + numRows * 2].name;
            if (wordList[word] === undefined) {
              wordList[word] = 1;
            } else {
              workBoard[i * numColumns + j].name = '';
              workBoard[i * numColumns + j + numRows].name = '';
              workBoard[i * numColumns + j + numRows * 2].name = '';
              workMessage = 'Duplicate word - word rejected';
            }
          }
        }
      }
      // Check for end of Game
      if (endOfGame) {
        workMessage = 'Game Complete';
      }
      return {
        ...prevGameState,
        message: workMessage,
        score: Object.keys(wordList).length,
        board: workBoard,
        endOfGame: workEndOfGame,
      };
    });
  }, []);

  // render
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View style={styles.container}>
        <View style={styles.nav}>
          <Button onPress={pressReset} title="Reset" color="blue" />
          <View style={endOfGame ? styles.itemInvisible : null}>
            <Button onPress={pressDone} title="Done" color="blue" disabled={endOfGame ? true : false} />
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
        <View style={styles.board}>
          <FlatList
            data={board}
            renderItem={renderBoard}
            style={styles.board}
            numColumns={numColumns}
            removeClippedSubviews={false}
          />
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
    fontWeight: 'bold',
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
