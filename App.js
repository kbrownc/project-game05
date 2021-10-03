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
console.log('********',Date());

const newBoard = [];
let i;
for (i = 0; i < (numColumns * numRows) ; i++) {
  newBoard[i] = {key: i+1, name: ''};
};

export default function App() {
  const [
    {
      message,
      score,
      board,
      wordList,
      endOfGame,
    },
    setGameState,
  ] = useState({
    message: 'Enter 1st word',
    score: 0,
    board: JSON.parse(JSON.stringify(newBoard)),
    wordList: {},
    endOfGame: false,
  });

  // render board
  const renderBoard = ({ item }) => {
    return (
      <View style={styles.item}>
        <TextInput style={styles.itemText} 
          onChangeText={(value) => enterLetter(value,item.key)} 
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
      let workWordList = prevGameState.wordList;
      console.log('Reset: at start wordList',wordList);
      console.log('Reset: at start workWordList',workWordList);
      Object.keys(workWordList).forEach(key => {delete workWordList[key]});
      console.log('Reset: after delete workWordList',workWordList);
      return {
        message: 'Reset Pressed',
        score: 0,
        board: JSON.parse(JSON.stringify(newBoard)),
        wordList: workWordList,
        endOfGame: false,
      };
    });
  }, []);

  // enter a Letter from keyboard
  const enterLetter = useCallback((value,key) => {
    setGameState(prevGameState => {
      let workBoard = prevGameState.board.slice();
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
      let workEndOfGame = false;
      let workWordList = prevGameState.wordList;
      console.log('DONE: before word search: workWordList',workWordList);
      let word = '';
      //  count the words on the board
      //  1) Count words on rows
      let i;
      let j;
      for (j = 0; j < numRows ; j++) {
        for (i = j * numRows; i < ((j + 1) * numColumns - 2) ; i++) {
          if (board[i].name !== '' &&
              board[i + 1].name !== '' &&
              board[i + 2].name !== '') {
            word = (board[i].name) + (board[i + 1].name) + (board[i + 2].name); 
            if (workWordList[word] === undefined) {
              workWordList[word] = 1;
            } else {
              workWordList[word] = workWordList[word] + 1;
            }
          }
        }
      }
      //  2) Count words on columns
      for (j = 0; j < numColumns ; j++) {
        for (i = 0; i < (numRows - 2) ; i++) {
          if (board[i * numColumns + j].name !== '' &&
              board[i * numColumns + j + numRows].name !== '' &&
              board[i * numColumns + j + (numRows * 2)].name !== '') {
            word = (board[i * numColumns + j].name) + (board[i * numColumns + j + numRows].name) + 
                    (board[i * numColumns + j + (numRows * 2)].name);       
            if (workWordList[word] === undefined) {
              workWordList[word] = 1;
            } else {
              workWordList[word] = workWordList[word] + 1;
            }
          }
        }
      }
      console.log('DONE: after word search: workWordList',workWordList);
      console.log('DONE: wordList',wordList);
      // Check for end of Game
      if (endOfGame) {
        workMessage = 'Game Complete';
      }
      return {
        ...prevGameState,
        message: workMessage,
        score: Object.keys(workWordList).length,
        wordList: workWordList,
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
      <View style={styles.board}>
        <FlatList data={board} renderItem={renderBoard} style={styles.board} numColumns={numColumns} removeClippedSubviews={false} />
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
