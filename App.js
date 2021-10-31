import React, { useState, useCallback, useEffect } from 'react';
import { globalStyles } from './global';
import { wordDictionary } from './WordDictionary';
import {
  Text,
  View,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  Button,
  TextInput,
  Alert,
  AsyncStorage,
} from 'react-native';

const numColumns = 8;
const numRows = 8;

let newBoard = new Array(numColumns * numRows).fill('');
let randomNumber = Math.floor(Math.random() * 63);
newBoard[randomNumber] = ' ';

export default function App() {
  const [{ message, score, board, previousBoard }, setGameState] = useState({
    message: 'Enter 1st letter',
    score: 0,
    board: JSON.parse(JSON.stringify(newBoard)),
    previousBoard: [],
  });

  // render board
  const renderBoard = ({ item, index }) => {
    return (
      <View style={item === ' ' ? [globalStyles.item, globalStyles.itemRed] : globalStyles.item}>
        <TextInput
          style={globalStyles.itemText}
          onChangeText={value => enterLetter(value, index)}
          autoCapitalze="characters"
          maxLength={2}
          value={item}
          editable={item === ' ' ? true : false}
        />
      </View>
    );
  };

  // press Reset button
  const pressReset = useCallback(() => {
    setGameState(prevGameState => {
      newBoard[randomNumber] = '';
      randomNumber = Math.floor(Math.random() * 63);
      newBoard[randomNumber] = ' ';
      return {
        message: 'Enter 1st letter',
        score: 0,
        board: JSON.parse(JSON.stringify(newBoard)),
        previousBoard: [],
      };
    });
  }, []);

  const pressSave = useCallback(async () => {
    await AsyncStorage.setItem('Board', JSON.stringify(board));
    setGameState(prevGameState => {
      let workMessage = 'Game saved';
      return {
        ...prevGameState,
        message: workMessage,
      };
    });
  }, [board]);

  // LOAD board if previously saved
  const load = useCallback(async () => {
    let savedBoard = await AsyncStorage.getItem('Board');
    setGameState(prevGameState => {
      let workBoard = JSON.parse(JSON.stringify(prevGameState.board));
      let workMessage = prevGameState.message;
      if (savedBoard !== null) {
        workBoard = JSON.parse(savedBoard);
        workMessage = 'Previous game loaded';
      }
      return {
        ...prevGameState,
        message: workMessage,
        board: JSON.parse(JSON.stringify(workBoard)),
      };
    });
  }, []);

  // REMOVED previously saved board if it exists
  const remove = async () => {
    try {
      await AsyncStorage.removeItem('Board');
    } catch (err) {
      alert(err);
    }
  };

  // LOAD and REMOVE saved board after render
  useEffect(() => {
    load();
    remove();
  }, []);

  // press Alert button
  const pressAlert = () => {
    const alertMessage =
      'Only 3-letter words defined to the Webster dictionary are allowed and get you points. The red squares are the only squares you can enter a letter into and represent all of your valid moves. No duplicate words are allowed. Words cannot lie along side another.';
    Alert.alert('How to Play', alertMessage, [{ text: 'understood' }]);
  };

  // enter a Letter from keyboard
  //    Need to validate entry of letters (spelling and duplicates)
  //    Neeed to check if we are at end of game
  //    Need to update score
  //
  //   previousBoard - an array listing what the board looked like after the previous turn
  //   wordList - list of the 3-letter words on the board
  const enterLetter = useCallback((value, item) => {
    setGameState(prevGameState => {
      let workBoard = JSON.parse(JSON.stringify(prevGameState.board));
      let workPreviousBoard = JSON.parse(JSON.stringify(prevGameState.board));
      let workMessage = '';
      let wordList = {};
      let word = '';
      let i;
      let j;
      // add letter to board
      workBoard[item] = value.trim();
      // mark squares on board that can be used (both sides of letter)
      //  - rows
      for (j = 0; j < numRows; j++) {
        for (i = j * numRows; i < (j + 1) * numColumns; i++) {
          if (workBoard[i] !== '' && workBoard[i] !== ' ') {
            if (i > 0 && i % numColumns !== 0 && workBoard[i - 1] === '') {
              workBoard[i - 1] = ' ';
            }
            if (i < numRows * numColumns && i % numColumns !== 7 && workBoard[i + 1] === '') {
              workBoard[i + 1] = ' ';
            }
          }
        }
      }
      //  - columns
      for (j = 0; j < numColumns; j++) {
        for (i = 0; i < numRows; i++) {
          if (workBoard[i * numColumns + j] !== '' && workBoard[i * numColumns + j] !== ' ') {
            if (i > 0 && workBoard[i * numColumns + j - numRows] === '') {
              workBoard[i * numColumns + j - numRows] = ' ';
            }
            if (i < numRows * numColumns && workBoard[i * numColumns + j + numRows] === '') {
              workBoard[i * numColumns + j + numRows] = ' ';
            }
          }
        }
      }
      // remove squares on board that cannot be used (those tht have letters on 2 corner sides)
      for (j = 0; j < numRows; j++) {
        for (i = j * numRows; i < (j + 1) * numColumns; i++) {
          if (
            workBoard[i] === ' ' &&
            (workBoard[i + 1] !== ' ' &&
              workBoard[i + 1] !== '' &&
              i % numColumns < 7 &&
              (workBoard[i + numColumns] !== undefined &&
                workBoard[i + numColumns] !== ' ' &&
                workBoard[i + numColumns] !== '') |
                (workBoard[i - numColumns] !== undefined &&
                  workBoard[i - numColumns] !== ' ' &&
                  workBoard[i - numColumns] !== '')) |
              (workBoard[i - 1] !== ' ' &&
                workBoard[i - 1] !== '' &&
                i % numColumns > 0 &&
                (workBoard[i + numColumns] !== undefined &&
                  workBoard[i + numColumns] !== ' ' &&
                  workBoard[i + numColumns] !== '') |
                  (workBoard[i - numColumns] !== undefined &&
                    workBoard[i - numColumns] !== ' ' &&
                    workBoard[i - numColumns] !== ''))
          ) {
            workBoard[i] = '';
          }
        }
      }
      //  find the words on the board (and mark squares at ends as no longer available)
      //  1) find words on rows
      for (j = 0; j < numRows; j++) {
        for (i = j * numRows; i < (j + 1) * numColumns - 2; i++) {
          if (
            workBoard[i] !== '' &&
            workBoard[i + 1] !== '' &&
            workBoard[i + 2] !== '' &&
            workBoard[i] !== ' ' &&
            workBoard[i + 1] !== ' ' &&
            workBoard[i + 2] !== ' '
          ) {
            word = workBoard[i] + workBoard[i + 1] + workBoard[i + 2];
            if (wordDictionary.indexOf(word.toLowerCase()) === -1) {
              workMessage = 'Word not found - ' + word;
              workBoard = workPreviousBoard;
            } else {
              if (wordList[word] === undefined) {
                wordList[word] = 1;
                if (i % numColumns > 0) {
                  workBoard[i - 1] = '';
                }
                if (i % numColumns <= 4 && i + 3 < 64) {
                  workBoard[i + 3] = '';
                }
              } else {
                workMessage = 'Duplicate word - word rejected - ' + word;
                workBoard = workPreviousBoard;
              }
            }
          }
        }
      }
      //  2) find words on columns
      for (j = 0; j < numColumns; j++) {
        for (i = 0; i < numRows - 2; i++) {
          if (
            workBoard[i * numColumns + j] !== '' &&
            workBoard[i * numColumns + j + numRows] !== '' &&
            workBoard[i * numColumns + j + numRows * 2] !== '' &&
            workBoard[i * numColumns + j] !== ' ' &&
            workBoard[i * numColumns + j + numRows] !== ' ' &&
            workBoard[i * numColumns + j + numRows * 2] !== ' '
          ) {
            word =
              workBoard[i * numColumns + j] +
              workBoard[i * numColumns + j + numRows] +
              workBoard[i * numColumns + j + numRows * 2];
            if (wordDictionary.indexOf(word.toLowerCase()) === -1) {
              workMessage = 'Word not found - ' + word;
              workBoard = workPreviousBoard;
            } else {
              if (wordList[word] === undefined) {
                wordList[word] = 1;
                if (i * numColumns + j - numRows >= 0) {
                  workBoard[i * numColumns + j - numRows] = '';
                }
                if (i * numColumns + j + numRows * 3 < 64) {
                  workBoard[i * numColumns + j + numRows * 3] = '';
                }
              } else {
                workMessage = 'Duplicate word - word rejected - ' + word;
                workBoard = workPreviousBoard;
              }
            }
          }
        }
      }
      if (workMessage === '') {
        workMessage = 'Enter next Letter';
      }
      // End of Game check
      if (workBoard.indexOf(' ') === -1) {
        workMessage = 'Game completed';
      }
      return {
        ...prevGameState,
        message: workMessage,
        score: Object.keys(wordList).length,
        board: workBoard,
        previousBoard: workPreviousBoard,
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
      <View style={globalStyles.container}>
        <View style={globalStyles.nav}>
          <Button onPress={pressReset} title="Reset" color="green" />
          <View style={globalStyles.itemNav}>
            <Text style={globalStyles.itemText}>Score</Text>
          </View>
          <View style={globalStyles.itemNav}>
            <Text style={globalStyles.itemText}>{score}</Text>
          </View>
          <Button onPress={pressSave} title="Save" color="red" />
          <Button onPress={pressAlert} title="About" color="green" />
        </View>
        <View style={globalStyles.messageRow}>
          <Text style={globalStyles.message}>{message}</Text>
        </View>
        <View style={globalStyles.board}>
          <FlatList
            data={board}
            renderItem={renderBoard}
            style={globalStyles.board}
            numColumns={numColumns}
            keyExtractor={(item, index) => index.toString()}
            removeClippedSubviews={false}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
