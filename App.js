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
  const [{ message, score, board, letterHistory, squareHistory }, setGameState] = useState({
    message: 'Enter 1st word',
    score: 0,
    board: JSON.parse(JSON.stringify(newBoard)),
    letterHistory: [],
    squareHistory: [],
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
        squareHistory: [],
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
  //  squareHistory - an array listing te squares on the board marked as valid for the entry of a letter
  //   wordList - list of the 3-letter words on the board
  const enterLetter = useCallback((value, item) => {
    setGameState(prevGameState => {
      console.log('ENTERLETTER', value, item);
      let workLetterHistory = JSON.parse(JSON.stringify(prevGameState.letterHistory));
      let workSquareHistory = JSON.parse(JSON.stringify(prevGameState.squareHistory));
      let workBoard = JSON.parse(JSON.stringify(prevGameState.board));
      let workMessage = 'enter a letter';
      let wordList = {};
      let word = '';
      let i;
      let j;
      // add letter to board
      workBoard[item] = value.trim();
      workLetterHistory.push(item);
      console.log('remove Letter',value,item,'   ', ...workSquareHistory);
      workSquareHistory.splice(workSquareHistory.indexOf(item),1);
      // mark squares on board that can be used (both sides of letter)
      //  - rows
      for (j = 0; j < numRows; j++) {
        for (i = j * numRows; i < (j + 1) * numColumns; i++) {
          if (workBoard[i] !== '' && workBoard[i] !== ' ') {
            if (i > 0 && i % 8 !== 0 && workBoard[i - 1] === '') {
              workBoard[i - 1] = ' ';
              workSquareHistory.push(i - 1);
              console.log('row add square left',i - 1,'   ',...workSquareHistory);
            }
            if (i < numRows * numColumns && i % 8 !== 7 && workBoard[i + 1] === '') {
              workBoard[i + 1] = ' ';
              workSquareHistory.push(i + 1);
              console.log('row add square right',i + 1,'   ',...workSquareHistory);
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
              workSquareHistory.push(i * numColumns + j - 8);
              console.log('col add square below',i,j,i * numColumns + j - 8,'   ',...workSquareHistory);
            }
            if (i < numRows * numColumns && workBoard[i * numColumns + j + 8] === '') {
              workBoard[i * numColumns + j + 8] = ' ';
              workSquareHistory.push(i * numColumns + j + 8);
              console.log('col add square above',i * numColumns + j + 8,'   ',...workSquareHistory);
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
            workSquareHistory.splice(workSquareHistory.indexOf(i),1);
            console.log('remove corner',i,'   ',...workSquareHistory);
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
            if (wordList[word] === undefined) {
              wordList[word] = 1;
              if (wordDictionary.indexOf(word.toLowerCase()) === -1) {
                workMessage = 'Word not found';
              }
              if (i % 8 > 0) {
                workBoard[i - 1] = '';
                if (workSquareHistory.indexOf(i - 1) !== -1) {
                  workSquareHistory.splice(workSquareHistory.indexOf(i - 1),1)};
                console.log('remove word row left',i - 1,'   ',...workSquareHistory);
              }
              if (i % 8 <= 4 && i + 3 < 64) {
                workBoard[i + 3] = '';
                if (workSquareHistory.indexOf(i + 3) !== -1) {
                workSquareHistory.splice(workSquareHistory.indexOf(i + 3),1)};
                console.log('remove word row right',i + 3,'   ',...workSquareHistory);
              }
            } else {
              workBoard[workLetterHistory[workLetterHistory.length - 1]] = '';
              workBoard[workLetterHistory[workLetterHistory.length - 2]] = ' ';
              workSquareHistory.push(workSquareHistory[workSquareHistory.length - 2]);
              workLetterHistory.pop();
              workLetterHistory.pop();
              workMessage = 'Duplicate word - word rejected';
              console.log('add square row duplicate   ',...workSquareHistory);
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
              if (wordDictionary.indexOf(word.toLowerCase()) === -1) {
                workMessage = 'Word not found';
              }
              if (i * numColumns + j - numRows >= 0) {
                workBoard[i * numColumns + j - numRows] = '';
                console.log('remove col word top indexOf **',i,j,workSquareHistory.indexOf(i * numColumns + j - numRows));
                if (workSquareHistory.indexOf(i * numColumns + j - numRows) !== -1) {
                  workSquareHistory.splice(workSquareHistory.indexOf(i * numColumns + j - numRows),1)};
                console.log('remove col word top',i * numColumns + j - numRows,
                    workSquareHistory.indexOf(i * numColumns + j - numRows),'   ',...workSquareHistory);            
              }
              if (i * numColumns + j + numRows * 3 < 64) {
                workBoard[i * numColumns + j + numRows * 3] = '';
                console.log('remove col word bottom indexOf **  ',i,j,workSquareHistory.indexOf(i * numColumns + j + numRows * 3));
                if (workSquareHistory.indexOf(i * numColumns + j + numRows * 3) !== -1) {
                  workSquareHistory.splice(workSquareHistory.indexOf(i * numColumns + j + numRows * 3),1)};
                console.log('remove col word bottom',i * numColumns + j + numRows * 3,
                    workSquareHistory.indexOf(i * numColumns + j + numRows * 3),j,i,'   ',...workSquareHistory);
              }
            } else {
              workBoard[workLetterHistory[workLetterHistory.length - 1]] = '';
              workBoard[workLetterHistory[workLetterHistory.length - 2]] = ' ';
              workSquareHistory.push(workLetterHistory[workLetterHistory.length - 2]);
              workLetterHistory.pop();
              workLetterHistory.pop();
              workMessage = 'Duplicate word - word rejected';
              console.log('add square col duplicate   ',...workSquareHistory);
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
        squareHistory: workSquareHistory,
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
