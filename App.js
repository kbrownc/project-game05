import React, { useState, useCallback } from 'react';
import {globalStyles} from './global';
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

const numColumns = 8;
const numRows = 8;

// This has not been incorporated yet
const wordLength = 3;
console.log('***************', Date());

let newBoard = new Array(numColumns * numRows).fill('');
newBoard[27] = ' ';

export default function App() {
  const [{ message, score, board, letterHistory }, setGameState] = useState({
    message: 'Enter 1st word',
    score: 0,
    board: JSON.parse(JSON.stringify(newBoard)),
    letterHistory: [],
  });

  // render board
  const renderBoard = ({ item, index }) => {
    if (item !== '' && item !== ' ') {
      console.log('RENDER Board', item, index);
    }
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
      return {
        message: 'Reset Pressed',
        score: 0,
        board: JSON.parse(JSON.stringify(newBoard)),
        letterHistory: [],
      };
    });
  }, []);

  // press Alert button
  const pressAlert = () => {
      console.log('ALERT');
      const alertMessage = 'These are the instructions on how to play this game';
      Alert.alert('How to Play', alertMessage, [{text: 'understood'}]);
      };

  // enter a Letter from keyboard
  //    Need to validate entry of letters (spelling and duplicates)
  //    Neeed to check if we are at end of game
  //    Need to update score
  //
  //  letterHistory - an array listing the letters entered onto the board in the order added
  //   wordList - list of the 3-letter words on the board
  const enterLetter = useCallback((value, item) => {
    setGameState(prevGameState => {
      console.log('ENTERLETTER');
      let workLetterHistory = JSON.parse(JSON.stringify(prevGameState.letterHistory));
      let workBoard = JSON.parse(JSON.stringify(prevGameState.board));
      let workMessage = 'Letter entered';
      let wordList = {};
      let wordList2 = [];
      let word = '';
      let i;
      let j;
      // add letter to board
      workBoard[item] = value.trim();
      workLetterHistory.push(item);
      //  find the words on the board that are greater than 3 letters
      //  1) find words on rows
      for (j = 0; j < numRows; j++) {
        for (i = j * numRows; i < (j + 1) * numColumns - 2; i++) {
          if (workBoard[i] !== '' && workBoard[i + 1] !== '' && workBoard[i + 2] !== '' && workBoard[i + 3] !== '' &&
            workBoard[i] !== ' ' && workBoard[i + 1] !== ' ' && workBoard[i + 2] !== ' ' && workBoard[i + 3] !== ' ') {
            workBoard[item] = ' ';
            workMessage = 'Word too long - letter rejected';
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
            workBoard[i * numColumns + j + numRows * 3] !== '' &&
            workBoard[i * numColumns + j] !== ' ' &&
            workBoard[i * numColumns + j + numRows] !== ' ' &&
            workBoard[i * numColumns + j + numRows * 2] !== ' ' &&
            workBoard[i * numColumns + j + numRows * 3] !== ' '
          ) {
            workMessage = 'Word too long - letter rejected';
            workBoard[item] = ' ';
          }
        }
      }
      // mark squares on board that can be used     
      //  - rows
      for (j = 0; j < numRows; j++) {
        for (i = j * numRows; i < (j + 1) * numColumns; i++) {
          if (workBoard[i] !== '' && workBoard[i] !== ' ') {
            if (i > 0 &&  i % 8 !== 0 && workBoard[i - 1] === ''){
            workBoard[i - 1] = ' ';
            } 
            if (i < (numRows * numColumns) && i % 8 !== 7 && workBoard[i + 1] === '') {
              workBoard[i + 1] = ' ';
            }
          }
        }
      }
      //  - columns
      for (j = 0; j < numColumns; j++) {
        for (i = 0; i < numRows; i++) {
          if (
            workBoard[i * numColumns + j] !== '' &&
            workBoard[i * numColumns + j] !== ' '
          ) {
            if (i > 0 && workBoard[i * numColumns + j - 8] === '') {
            workBoard[i * numColumns + j - 8] = ' ';
            } 
            if (i < (numRows * numColumns) && workBoard[i * numColumns + j + 8] === '') {
              workBoard[i * numColumns + j + 8] = ' ';
            }
          }
        }
      }
      //  find the words on the board
      //  1) find words on rows
      for (j = 0; j < numRows; j++) {
        for (i = j * numRows; i < (j + 1) * numColumns - 2; i++) {
          if (workBoard[i] !== '' && workBoard[i + 1] !== '' && workBoard[i + 2] !== '' &&
            workBoard[i] !== ' ' && workBoard[i + 1] !== ' ' && workBoard[i + 2] !== ' ') {
            word = workBoard[i] + workBoard[i + 1] + workBoard[i + 2];
            if (wordList[word] === undefined) {
              wordList[word] = 1;
              wordList2[wordList2.length] = {key: i, name: workBoard[i]};
              wordList2[wordList2.length] = {key: i + 1, name: workBoard[i + 1]};
              wordList2[wordList2.length] = {key: i + 2, name: workBoard[i + 2]};
              workBoard[i - 1] = '';
              workBoard[i + 3] = '';
            } else {
              workBoard[workLetterHistory[workLetterHistory.length - 1]] = '';
              workBoard[workLetterHistory[workLetterHistory.length - 2]] = '';
              workLetterHistory.pop();
              workLetterHistory.pop();
              workMessage = 'Duplicate word - word rejected';
              workBoard[i + 1] = '';
              workBoard[i + 2] = '';
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
            if (wordList[word] === undefined) {
              wordList[word] = 1;
              wordList2[wordList2.length] = 
                  {key: i * numColumns + j, name: workBoard[i * numColumns + j]};
              wordList2[wordList2.length] = 
                  {key: i * numColumns + j + numRows, name: workBoard[i * numColumns + j + numRows]};
              wordList2[wordList2.length] = 
                  {key: i * numColumns + j + numRows * 2, name: workBoard[i * numColumns + j + numRows * 2]};
              workBoard[i * numColumns + j - numRows] = '';
              workBoard[i * numColumns + j + numRows * 3] = '';
            } else {
              workBoard[workLetterHistory[workLetterHistory.length - 1]] = '';
              workBoard[workLetterHistory[workLetterHistory.length - 2]] = '';
              workLetterHistory.pop();
              workLetterHistory.pop();
              workMessage = 'Duplicate word - word rejected';
              workBoard[i * numColumns + j + numRows] = '';
              workBoard[i * numColumns + j + numRows * 2] = '';
            }
          }
        }
      }
      console.log('wordList',wordList);
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
