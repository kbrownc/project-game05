import React, { useState, useCallback } from 'react';
import { globalStyles } from './global';
import { allWords } from './ThreeLetterWords';
import {
  Text,
  View,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  Button,
  TextInput,
  Alert,
} from 'react-native';

let wordDictionary = [];

for (let i = 0; i < allWords.length; i += 3) {
  wordDictionary.push(allWords.substring(i, i + 3));
}

const numColumns = 8;
const numRows = 8;

let newBoard = new Array(numColumns * numRows).fill('');
let randomNumber = Math.floor(Math.random() * 63);
newBoard[0] = ' ';

export default function App() {
  const [{ message, score, board, letterHistory, previousBoard }, setGameState] = useState({
    message: 'Enter 1st word',
    score: 0,
    board: JSON.parse(JSON.stringify(newBoard)),
    letterHistory: [],
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
      console.log('RESET');
      newBoard[randomNumber] = '';
      randomNumber = Math.floor(Math.random() * 63);
      newBoard[0] = ' ';
      return {
        message: 'Enter 1st word',
        score: 0,
        board: JSON.parse(JSON.stringify(newBoard)),
        letterHistory: [],
        previousBoard: [],
      };
    });
  }, []);

  // press Alert button
  const pressAlert = () => {
    const alertMessage = 'These are the instructions on how to play this game';
    Alert.alert('How to Play', alertMessage, [{ text: 'understood' }]);
  };

  // enter a Letter from keyboard
  //    Need to validate entry of letters (spelling and duplicates)
  //    Neeed to check if we are at end of game
  //    Need to update score
  //
  //  letterHistory - an array listing the letters entered onto the board in the order added
  //  previousBoard - an array listing what the board looked like after the previous turn
  //   wordList - list of the 3-letter words on the board
  const enterLetter = useCallback((value, item) => {
    setGameState(prevGameState => {
      console.log('ENTERLETTER', value, item);
      let workLetterHistory = JSON.parse(JSON.stringify(prevGameState.letterHistory));
      let workBoard = JSON.parse(JSON.stringify(prevGameState.board));
      let workPreviousBoard = JSON.parse(JSON.stringify(prevGameState.board));
      let workMessage = 'enter a letter';
      let wordList = {};
      let word = '';
      let i;
      let j;
      // add letter to board
      workBoard[item] = value.trim();
      workLetterHistory.push(item);
      // mark squares on board that can be used (both sides of letter)
      //  - rows
      for (j = 0; j < numRows; j++) {
        for (i = j * numRows; i < (j + 1) * numColumns; i++) {
          if (workBoard[i] !== '' && workBoard[i] !== ' ') {
            if (i > 0 && i % 8 !== 0 && workBoard[i - 1] === '') {
              workBoard[i - 1] = ' ';
            }
            if (i < numRows * numColumns && i % 8 !== 7 && workBoard[i + 1] === '') {
              workBoard[i + 1] = ' ';
            }
          }
        }
      }
      //  - columns
      for (j = 0; j < numColumns; j++) {
        for (i = 0; i < numRows; i++) {
          if (workBoard[i * numColumns + j] !== '' && workBoard[i * numColumns + j] !== ' ') {
            if (i > 0 && workBoard[i * numColumns + j - 8] === '') {
              workBoard[i * numColumns + j - 8] = ' ';
            }
            if (i < numRows * numColumns && workBoard[i * numColumns + j + 8] === '') {
              workBoard[i * numColumns + j + 8] = ' ';
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
              i % 8 <  7 &&
              (workBoard[i + 8] !== undefined && workBoard[i + 8] !== ' ' && workBoard[i + 8] !== '') |
                (workBoard[i - 8] !== undefined && workBoard[i - 8] !== ' ' && workBoard[i - 8] !== '')) |
              (workBoard[i - 1] !== ' ' &&
                workBoard[i - 1] !== '' &&
                i % 8 >  0 &&
                (workBoard[i + 8] !== undefined && workBoard[i + 8] !== ' ' && workBoard[i + 8] !== '') |
                  (workBoard[i - 8] !== undefined && workBoard[i - 8] !== ' ' && workBoard[i - 8] !== ''))
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
                workMessage = 'Word not found';
                console.log('Word not found',word);
                workLetterHistory.pop();
                workBoard = workPreviousBoard;
            } else {
              if (wordList[word] === undefined) {
                wordList[word] = 1;
                if (i % 8 > 0) {
                workBoard[i - 1] = '';
                }
                if (i % 8 <= 4 && i + 3 < 64) {
                workBoard[i + 3] = '';
                }
                workMessage = 'Enter next Letter';
              } else {
                workMessage = 'Duplicate word - word rejected';
                console.log('Dup word',word);
                workLetterHistory.pop();
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
                workMessage = 'Word not found';
                console.log('Word not found',word);
                workLetterHistory.pop();
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
                workMessage = 'Enter next Letter';
              } else {
                workMessage = 'Duplicate word - word rejected';
                console.log('Dup word',word);
                workLetterHistory.pop();
                workBoard = workPreviousBoard;
              }
            }
          }
        }
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
        letterHistory: workLetterHistory,
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
          <Button onPress={pressReset} title="Reset" color="red" />
          <View style={globalStyles.itemNav}>
            <Text style={globalStyles.itemText}>Score</Text>
          </View>
          <View style={globalStyles.itemNav}>
            <Text style={globalStyles.itemText}>{score}</Text>
          </View>
          <Button onPress={pressAlert} title="About" color="green" />
        </View>
        <View style={globalStyles.message}>
          <View style={globalStyles.messageRow}>
            <Text style={globalStyles.message}>{message}</Text>
          </View>
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
