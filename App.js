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
console.log('***************', Date());

const newBoard = new Array(numColumns * numRows).fill('');

export default function App() {
  const [{ message, score, board, letterHistory }, setGameState] = useState({
    message: 'Enter 1st word',
    score: 0,
    board: JSON.parse(JSON.stringify(newBoard)),
    letterHistory: [],
  });

  // render board
  const renderBoard = ({ item, index }) => {
    if (item !== '') {
      console.log('RENDER Board',index);
    }
    return (
      <View style={styles.item}>
        <TextInput
          style={styles.itemText}
          onChangeText={value => enterLetter(value, index)}
          autoCapitalze="characters"
          maxLength={1}
          value={item}
          editable={item === '' ? true : false}
        />
      </View>
    );
  };

  // press Reset button
  const pressReset = useCallback(() => {
    setGameState(prevGameState => {
      console.log('RESET');
      return {
        message: 'Reset Pressed',
        score: 0,
        board: JSON.parse(JSON.stringify(newBoard)),
        letterHistory: [],
      };
    });
  }, []);

  // enter a Letter from keyboard
  const enterLetter = useCallback((value, item) => {
    setGameState(prevGameState => {
      console.log('ENTERLETTER');
      let workLetterHistory = JSON.parse(JSON.stringify(prevGameState.letterHistory));
      let workBoard = JSON.parse(JSON.stringify(prevGameState.board));
      let workMessage = 'Letter entered';
      workBoard[item] = value;
      workLetterHistory.push(item);
      return {
        ...prevGameState,
        message: workMessage,
        board: workBoard,
        letterHistory: workLetterHistory,
      };
    });
  }, []);

  // press DONE entering the letters button
  //    Need to validate entry of letters (spelling and duplicates)
  //    Neeed to check if we are at end of game
  //    Need to update score
  //
  //  letterHistory - an array listing the letters entered onto the board in the order added
  //   wordList - list of the 3-letter words on the board
  const pressDone = useCallback(() => {
    setGameState(prevGameState => {
      console.log('DONE');
      let workMessage = 'Done button';
      let workBoard = JSON.parse(JSON.stringify(prevGameState.board));
      let workLetterHistory = JSON.parse(JSON.stringify(prevGameState.letterHistory));
      let wordList = {};
      let wordList2 = [];
      let word = '';
      //  count the words on the board
      //  1) Count words on rows
      let i;
      let j;
      for (j = 0; j < numRows; j++) {
        for (i = j * numRows; i < (j + 1) * numColumns - 2; i++) {
          if (workBoard[i] !== '' && workBoard[i + 1] !== '' && workBoard[i + 2] !== '') {
            word = workBoard[i] + workBoard[i + 1] + workBoard[i + 2];
            if (wordList[word] === undefined) {
              wordList[word] = 1;
              wordList2[wordList2.length] = {key: i, name: workBoard[i]};
              wordList2[wordList2.length] = {key: i + 1, name: workBoard[i + 1]};
              wordList2[wordList2.length] = {key: i + 2, name: workBoard[i + 2]};
            } else {
              workBoard[workLetterHistory[workLetterHistory.length - 1]] = '';
              workBoard[workLetterHistory[workLetterHistory.length - 2]] = '';
              workLetterHistory.pop();
              workLetterHistory.pop();
              workMessage = 'Duplicate word - word rejected';
            }
          }
        }
      }
      //  2) Count words on columns
      for (j = 0; j < numColumns; j++) {
        for (i = 0; i < numRows - 2; i++) {
          if (
            workBoard[i * numColumns + j] !== '' &&
            workBoard[i * numColumns + j + numRows] !== '' &&
            workBoard[i * numColumns + j + numRows * 2] !== ''
          ) {
            word =
              workBoard[i * numColumns + j] +
              workBoard[i * numColumns + j + numRows] +
              workBoard[i * numColumns + j + numRows * 2];
            if (wordList[word] === undefined) {
              wordList[word] = 1;
              wordList2[wordList2.length] = 
                  {key: i * numColumns + j, name: workBoard[i * numColumns + j]};
              wordList2[wordList2.length] = 
                  {key: i * numColumns + j + numRows, name: workBoard[i * numColumns + j + numRows]};
              wordList2[wordList2.length] = 
                  {key: i * numColumns + j + numRows * 2, name: workBoard[i * numColumns + j + numRows * 2]};
            } else {
              workBoard[workLetterHistory[workLetterHistory.length - 1]] = '';
              workBoard[workLetterHistory[workLetterHistory.length - 2]] = '';
              workLetterHistory.pop();
              workLetterHistory.pop();
              workMessage = 'Duplicate word - word rejected';
            }
          }
        }
      }
      console.log('wordList',wordList);
      console.log('wordList2',wordList2);
      return {
        ...prevGameState,
        message: workMessage,
        score: Object.keys(wordList).length,
        board: workBoard,
        letterHistory: workLetterHistory,
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
          <View>
            <Button onPress={pressDone} title="Done" color="blue" disabled={false} />
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
            keyExtractor={(item, index) => index.toString()}
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
