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

let newBoard = new Array(numColumns * numRows).fill('');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Dump out AsyncStorage
AsyncStorage.getAllKeys((err, keys) => {
  AsyncStorage.multiGet(keys, (error, stores) => {
    stores.map((result, i, store) => {
      console.log('AsyncStorage', { [store[i][0]]: store[i][1] });
      console.log('-----------------------------------------------');
      return true;
    });
  });
});

export default function App() {
  const [{ message, score, board, previousBoard }, setGameState] = useState({
    message: 'Enter 1st letter',
    score: 0,
    board: JSON.parse(JSON.stringify(newBoard)),
    previousBoard: [],
  });
  const [time, setTime] = useState(300);
  const [timerOn, setTimerOn] = useState(true);
  const [level, setLevel] = useState('**init**');
  const [previousScore, setPreviousScore] = useState(0);

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
    console.log('Reset');
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
      if (level === 'Beginner'){
        setTime(1200);
      } else if (level === 'Standard') {
        setTime(180);
      } else if (level === 'Expert') {
        setTime(180);
      } else {
        setTime(1200);
      };
      return {
        message: 'Enter 1st letter',
        score: 0,
        board: JSON.parse(JSON.stringify(eLL.board)),
        previousBoard: [],
      };
    });
  }, []);

  // Update Level if button is pressed
  const pressLevel = useCallback(() => {
    console.log('score',score);
    if (score === 0) {
      let workLevel = 'xxxx';
      if (level === 'Beginner') {
        setLevel('Standard');
        setTime(180);
        workLevel = 'Standard';
      } else if (level === 'Standard') {
        setLevel('Expert');
        setTime(180);
        workLevel = 'Expert';
      } else if (level === 'Expert') {
        setLevel('Beginner');
        setTime(1200);
        workLevel = 'Beginner';
      } else {
        setLevel('Default');
        setTime(1200);
        workLevel = 'Beginner';
      };
      setLevelStorage(workLevel);
    }
  }, [level]);

  // Save board/time in progress
  const pressSave = useCallback(async () => {
    await AsyncStorage.setItem('Board', JSON.stringify(board));
    await AsyncStorage.setItem('timeLeft', JSON.stringify(time));
    setGameState(prevGameState => {
      let workMessage = 'Game saved';
      return {
        ...prevGameState,
        message: workMessage,
      };
    });
  }, [board,time]);

  // set level in local storage
  const setLevelStorage = async level => {
    AsyncStorage.setItem('level', level);
    return level;
  };

  // set highscore
  const setHighScores = async highScores => {
    AsyncStorage.setItem('highScoresList', JSON.stringify(highScores));
    return highScores;
  };

  // get highscore
  const getHighScores = async () => {
    let highScores = await AsyncStorage.getItem('highScoresList');
    return highScores
  };

  // LOAD board if previously saved
  const loadBoard = useCallback(async () => {
    let savedBoard = await AsyncStorage.getItem('Board');
    setGameState(prevGameState => {
      let workBoard = JSON.parse(JSON.stringify(prevGameState.board));
      let workScore = 0;
      let workMessage = prevGameState.message;
      if (savedBoard !== null) {
        workBoard = JSON.parse(savedBoard);
        workMessage = 'Previous game loaded';
        let eLL = enterLetterLogic(' ', 0, workBoard);
        workScore = eLL.score;
      }
      return {
        ...prevGameState,
        message: workMessage,
        score: workScore,
        board: JSON.parse(JSON.stringify(workBoard)),
      };
    });
  }, []);

  // LOAD Time if previously saved
  const loadTime = useCallback(async () => {
    let savedTime = await AsyncStorage.getItem('timeLeft');
    setTime(prevTime => {
      let workTime = JSON.parse(JSON.stringify(time));
      if (savedTime !== null) {
        workTime = JSON.parse(savedTime);
      }
      return workTime
    });
  }, []);

  // Remove previously saved board if it exists
  const removeBoard = async () => {
    try {
      await AsyncStorage.removeItem('Board');
    } catch (err) {
      alert(err);
    }
  };

  // Remove level (Testing purposes only)
  const removeLevel = async () => {
    try {
      await AsyncStorage.removeItem('level');
    } catch (err) {
      alert(err);
    }
  };

  // Remove previously saved time if it exists
  const removeTime = async () => {
    try {
      await AsyncStorage.removeItem('timeLeft');
    } catch (err) {
      alert(err);
    }
  };

  // Remove previously saved highScoresList if it exists (for testing purposes only) ************
  const removeHighScores = async () => {
    try {
      await AsyncStorage.removeItem('highScoresList').then(() => console.log('removeHighScores has run'));
    } catch (err) {
      alert(err);
    }
  };

  // Load previously saved Level if it exists
  const loadLevel = async () => {
    let workLeve2 = await AsyncStorage.getItem('level');   
   return workLeve2;
  };

  // Load Level on app startup and store in state
  useEffect(() => {
    loadLevel().then( workLeve2 => { 
      if (workLeve2 === null) {
        workLeve2 = "Beginner";
      };      
      setLevel(workLeve2);
      if (workLeve2 === 'Beginner') {
        setTime(1200);
      } else if (workLeve2 === 'Standard') {
        setTime(180);
      } else if (workLeve2 === 'Expert') {
        setTime(180);
      } else {
        setTime(1200);
      };
    });
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
    loadBoard();
    removeBoard();
    loadTime();
    removeTime();
 //   removeHighScores();
 //   removeLevel();
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
    return getHighScores().then((highScores) => {
      if (highScores === null) {
        highScores = '[{"date":"1900-01-01","score":0,"level":"xxxxxx"}]';
      };
      for (let { date: d, score: s, level: l } of JSON.parse(highScores)) {
        alertMessage1 = d + '---' + s + '---' + l + ' ' + '  ';
        alertMessage2 = alertMessage2 + alertMessage1;
      }
      const alertMessage3 =
        '\n\nOnly 3-letter words defined in the Webster dictionary are allowed and get you points. The red squares are the only squares you can enter a letter into and represent all of your valid moves. No duplicate words are allowed. Words cannot lie along side another. The SAVE button allow to store the current board for future use which will load automatically at the next session you play.'
        + 'Each letter has a weighted score which is used to calculate the score of a word. The game has a timer, the starting value (plus bonus seconds) are a function of the difficult you have selected. Your top 5 scores are saved with the difficulty and the date you played that game. Game difficulty cannot be changed in the middle of a game.';
      const alertMessage = JSON.stringify(alertMessage2) + alertMessage3;
      Alert.alert('Your Top 5 scores/How to Play', alertMessage, [{ text: 'understood' }]);
    });
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
    let workBoard = JSON.parse(JSON.stringify(tempBoard));
    let workPreviousBoard = JSON.parse(JSON.stringify(tempBoard));
    let workMessage = '';
    let wordList = {};
    let word = '';
    let workScore = 0;
    let i;
    let j;
    // add letter to board (if value = ' ' then this is only to calculate score)
    if (value !== ' ') {
      workBoard[item] = value.trim();
    }
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
    // Determine if extra time should be awarded based on points accumulated
    workMessage = rewardExtraTime();
    // If no other messages have been generated, issue this generic one
    if (workMessage === '') {
      workMessage = 'Enter next Letter';
    }
    // End of Game check
    if (workBoard.indexOf(' ') === -1 || workScore > 5) {
      workMessage = 'Game completed';
      // Create score for current round
      let today = new Date();
      let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      const recentScore = {
        date: date.toString(),
        score: workScore,
        level: level,
      };
      updateHighScores(recentScore);
    };    
      return {
        message: workMessage,
        score: workScore,
        board: workBoard,
        previousBoard: workPreviousBoard,
      };
  };

  // updateHighScores function
  const updateHighScores = (recentScore) => {
    // Get previous highScores from storage
    getHighScores().then((highScores) => {
      if (highScores === null) {
        highScores = '[{"date":"1900-01-01","score":0,"level":"xxxxxx"}]';
      };
      console.log('updateHighScores highScores',highScores);
      let highScoresOld = JSON.parse(highScores);
      highScoresOld.push(recentScore);
      // Sort highScores and take top 5 scores
      highScoresOld.sort((a, b) => b.score - a.score);
      highScoresOld.splice(5);
      // Store new list of highScores
      let setHighScoresPromise = setHighScores(highScoresOld);
      setHighScoresPromise
        .then(highScores => { 
          return;
         })
        .catch(err => console.log('err', err));  
    })
  };

  // reward extra time based on score
  const rewardExtraTime = () => {
    let workMessage = '';
     if (level === 'Standard') {
        if (score > 24 && previousScore < 25) {
          workMessage = 'You are awarded 40 extra seconds';
          setPreviousScore(score);
          setTime( prevTime => prevTime + 40);
        } else if (score > 49 && previousScore < 50) {
          workMessage = 'You are awarded 40 extra seconds';
          setPreviousScore(score);
          setTime(prevTime => prevTime + 40);
        } else if (score > 74 && previousScore < 75) {
          workMessage = 'You are awarded 40 extra seconds';
          setPreviousScore(score);
          setTime(prevTime => prevTime + 40);
        }
      }; 
      if (level === 'Expert') {
        if (score > 24 && previousScore < 25) {
          workMessage = 'You are awarded 20 extra seconds';
          setPreviousScore(score);
          setTime(prevTime => prevTime + 20);
        } else if (score > 49 && previousScore < 50) {
          workMessage = 'You are awarded 20 extra seconds';
          setPreviousScore(score);
          setTime(prevTime => prevTime + 20);
        } else if (score > 74 && previousScore < 75) {
          workMessage = 'You are awarded 20 extra seconds';
          setPreviousScore(score);
          setTime(prevTime => prevTime + 20);
        }
      }; 
      return workMessage;
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
              {Math.floor(time / 60) + ':' + ('0' + Math.floor(time % 60)).slice(-2)}
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
        <View style={globalStyles.nav}>
          <View style={globalStyles.messageRow}>
            <Text style={globalStyles.message}>{message}</Text>
          </View>
          <Button onPress={pressLevel} title={level} color="green" />
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
