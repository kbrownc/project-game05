import React, { useState, useCallback, useEffect } from 'react';
import { globalStyles } from './global';
import { wordDictionary } from './WordDictionary';
import { letterPoints } from './LetterPoints';
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
const level = 'Expert';

let newBoard = new Array(numColumns * numRows).fill('');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default function App() {
  const [{ message, score, board, previousBoard }, setGameState] = useState({
    message: 'Enter 1st letter',
    score: 0,
    board: JSON.parse(JSON.stringify(newBoard)),
    previousBoard: [],
  });
  const [time, setTime] = useState(300);
  const [timerOn, setTimerOn] = useState(true);

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
          editable={item === ' ' && time > 0 ? true : false}
        />
      </View>
    );
  };

  // press Reset button
  const pressReset = useCallback(() => {
    setGameState(prevGameState => {
      let workBoard = JSON.parse(JSON.stringify(newBoard));
      let randomNumberIndex = Math.floor(Math.random() * 63);
      let randomNumber = Math.floor(Math.random() * 25);
      let randomNumberValue = alphabet.substring(randomNumber, randomNumber + 1);
      let eLL = enterLetterLogic(randomNumberValue, randomNumberIndex, workBoard);
      randomNumberIndex = Math.floor(Math.random() * 63);
      randomNumber = Math.floor(Math.random() * 25);
      randomNumberValue = alphabet.substring(randomNumber, randomNumber + 1);
      eLL = enterLetterLogic(randomNumberValue, randomNumberIndex, eLL.board);
      randomNumberIndex = Math.floor(Math.random() * 63);
      randomNumber = Math.floor(Math.random() * 25);
      randomNumberValue = alphabet.substring(randomNumber, randomNumber + 1);
      eLL = enterLetterLogic(randomNumberValue, randomNumberIndex, eLL.board);
      setTimerOn(true);
      setTime(300);
      return {
        message: 'Enter 1st letter',
        score: 0,
        board: JSON.parse(JSON.stringify(eLL.board)),
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

  // Remove previously saved board if it exists
  const remove = async () => {
    try {
      await AsyncStorage.removeItem('Board');
    } catch (err) {
      alert(err);
    }
  };

  // Load and Remove saved board after render, but onlu on app startup
  useEffect(() => {
    load();
    remove();
  }, []);

  // Set and update timer whenever 'timerOn' or 'time' changes
  useEffect(() => {
    let interval = null;
    if (timerOn && time > 0) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerOn, time]);

  // Load random letters in random spots when app loads
  useEffect(() => {
    let randomNumberIndex = Math.floor(Math.random() * 63);
    let randomNumber = Math.floor(Math.random() * 25);
    let randomNumberValue = alphabet.substring(randomNumber, randomNumber + 1);
    enterLetter(randomNumberValue, randomNumberIndex);
    randomNumberIndex = Math.floor(Math.random() * 63);
    randomNumber = Math.floor(Math.random() * 25);
    randomNumberValue = alphabet.substring(randomNumber, randomNumber + 1);
    enterLetter(randomNumberValue, randomNumberIndex);
    randomNumberIndex = Math.floor(Math.random() * 63);
    randomNumber = Math.floor(Math.random() * 25);
    randomNumberValue = alphabet.substring(randomNumber, randomNumber + 1);
    enterLetter(randomNumberValue, randomNumberIndex);
  }, []);

  // press Alert button
  const pressAlert = () => {
    let alertMessage1;
    let alertMessage2 = '';
    const alertMessage0 = [
      {
        date: '2021-01-22',
        score: 78,
        level: 'Expert',
      },
      {
        date: '1999-03-02',
        score: 101,
        level: 'Beginner',
      },
      {
        date: '1999-03-02',
        score: 98,
        level: 'Beginner',
      },
      {
        date: '1999-03-02',
        score: 50,
        level: 'Beginner',
      },
      {
        date: '1999-03-02',
        score: 99,
        level: 'Beginner',
      },
    ];
    for ( let {date: d, score: s, level: l} of alertMessage0) {
      alertMessage1 = (d + '---' + s + '---' + l) + " ";
      alertMessage2 = alertMessage1 + alertMessage2;
    }

    const alertMessage3 =
      '\n\nOnly 3-letter words defined to the Webster dictionary are allowed and get you points. The red squares are the only squares you can enter a letter into and represent all of your valid moves. No duplicate words are allowed. Words cannot lie along side another. The SAVE button allow to store the current board for future use which will load automatically at the next session you play.';

    const alertMessage = JSON.stringify(alertMessage2) + alertMessage3;
    Alert.alert('Your Highscores/How to Play', alertMessage, [{ text: 'understood' }]);
  };

  // enterLetterLogic function
  //
  //    enter a Letter from keyboard
  //      Need to validate entry of letters (spelling and duplicates)
  //      Neeed to check if we are at end of game
  //      Need to update score
  //    previousBoard - an array listing what the board looked like after the previous turn
  //    wordList - list of the 3-letter words on the board
  const enterLetterLogic = (value, item, tempBoard) => {
    // let workBoard = JSON.parse(JSON.stringify(prevGameState.board));
    // let workPreviousBoard = JSON.parse(JSON.stringify(prevGameState.board));
    let workBoard = JSON.parse(JSON.stringify(tempBoard));
    let workPreviousBoard = JSON.parse(JSON.stringify(tempBoard));
    let workMessage = '';
    let wordList = {};
    let word = '';
    let workScore = 0;
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
    // remove squares on board that cannot be used (those that have letters on 2 corner sides)
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
    //  find the words on the board for spelling/duplicates (and mark squares at ends as no longer available)
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
              // Calculate total value of word
              workScore =
                workScore +
                letterPoints.find(item => {
                  return item.letter === workBoard[i];
                }).point;
              workScore =
                workScore +
                letterPoints.find(item => {
                  return item.letter === workBoard[i + 1];
                }).point;
              workScore =
                workScore +
                letterPoints.find(item => {
                  return item.letter === workBoard[i + 2];
                }).point;
              //
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
              workScore =
                workScore +
                letterPoints.find(item => {
                  return item.letter === workBoard[i * numColumns + j];
                }).point;
              workScore =
                workScore +
                letterPoints.find(item => {
                  return item.letter === workBoard[i * numColumns + j + numRows];
                }).point;
              workScore =
                workScore +
                letterPoints.find(item => {
                  return item.letter === workBoard[i * numColumns + j + numRows * 2];
                }).point;
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
    if (workBoard.indexOf(' ') === -1 || workScore > 5) {
      workMessage = 'Game completed';
      const highScores = [
      {
        date: '2021-01-22',
        score: 78,
        level: 'Expert',
      },
      {
        date: '1999-03-02',
        score: 101,
        level: 'Beginner',
      },
      {
        date: '1999-03-02',
        score: 98,
        level: 'Beginner',
      },
      {
        date: '1999-03-02',
        score: 1,
        level: 'Beginner',
      },
      {
        date: '1999-03-02',
        score: 2,
        level: 'Beginner',
      },
    ];
      // const highScores = JSON.parse(async () => {await AsyncStorage.getItem('highscores') || []}());
      
      // if (highScores !== null) {
      //   highScores2 = JSON.parse(highScores);
      // } else {
      //   highScores2 = [];
      // };
      let today = new Date();
      let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      console.log('today', today);
      console.log('date', date);
      const recentScore = {
        date: date,
        score: workScore,
        level: level,
      };
      highScores.push(recentScore);
      highScores.sort((a, b) => b.score - a.score);
      highScores.splice(5);
      //console.log('highScores',highScores);
      // save highScores into storage
    }
    return {
      message: workMessage,
      score: workScore,
      board: workBoard,
      previousBoard: workPreviousBoard,
    };
  };

  // Enter a Letter from keyboard
  // - calls enterLetterLogic which has detailed logic
  const enterLetter = useCallback((value, item) => {
    setGameState(prevGameState => {
      const eLL = enterLetterLogic(value, item, prevGameState.board);
      return {
        ...prevGameState,
        message: eLL.message,
        score: eLL.score,
        board: eLL.board,
        previousBoard: eLL.previousBoard,
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
            <Text style={globalStyles.itemText1}>
              {'0' + Math.floor(time / 60) + ':' + ('0' + Math.floor(time % 60)).slice(-2)}
            </Text>
          </View>
          <View style={globalStyles.itemNav}>
            <Text style={globalStyles.itemText1}>Score</Text>
          </View>
          <View style={globalStyles.itemNav}>
            <Text style={globalStyles.itemText1}>{score}</Text>
          </View>
          <Button onPress={pressSave} title="Save" color="green" />
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
