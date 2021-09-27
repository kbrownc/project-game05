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
  if (i === 27) {
    newBoard[i] = {key: i+1, name: 'C'};
  } else if (i === 28) {
    newBoard[i] = {key: i+1, name: 'A'};
  } else if (i === 29) {
    newBoard[i] = {key: i+1, name: 'T'};
  } else {
    newBoard[i] = {key: i+1, name: ' '};
  }
};

export default function App() {
  const [
    {
      letter1,
      letter2,
      message,
      score,
      board,
      endOfGame,
    },
    setGameState,
  ] = useState({
    letter1: '',
    letter2: '',
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

// Select a cell on the board
  const pressCell = useCallback((key) => {
    setGameState(prevGameState => {
      let workBoard = prevGameState.board.slice();
      let workLetter1 = prevGameState.letter1;
      let workLetter2 = prevGameState.letter2;
      let workMessage = 'Pressed a cell';
      if (letter1 !== '') {
        workBoard[key - 1].name = letter1;
        workLetter1 = '';
      } else if (letter2 !== '') {
        workBoard[key - 1].name = letter2;
        workLetter2 = '';
      }
      return {
        ...prevGameState,
        letter1: workLetter1,
        letter2: workLetter2,
        message: workMessage,
        board: workBoard,
      };
    });
  }, [letter1, letter2]);

  // press Reset button
  const pressReset = useCallback(() => {
    setGameState(prevGameState => {
      return {
        letter1: '',
        letter2: '',
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
      let workLetter1 = prevGameState.letter1;
      let workLetter2 = prevGameState.letter2;
      let workMessage = '';
      if (letter1 === '') {
        workLetter1 = val;
        workMessage = 'letter 1 entered';
      } else {
        workLetter2 = val;
        workMessage = 'letter 2 entered';
      }
      return {
        ...prevGameState,
        letter1: workLetter1,
        letter2: workLetter2,
        message: workMessage,
      };
    });
  }, [letter1, letter2]);

  // press DONE entering the letters button
  //    Need to validate entry of letters (spelling and duplicates)
  //    Neeed to check if we are at end of game
  //    Need to update score
  const pressDone = useCallback(() => {
    setGameState(prevGameState => {
      let workBoard = prevGameState.board.slice();
      let workMessage = 'Done button';
      let workEndOfGame = false;
      let scoreAdj = 1;
      // Check for end of Game
      if (endOfGame) {
        workMessage = 'Game Complete';
      }
      return {
        ...prevGameState,
        message: workMessage,
        score: prevGameState.score + scoreAdj,
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
      <Text>Enter first Letter</Text>
      </View>
      <View style={styles.nav}>
      <TextInput style={styles.input} 
        onChangeText={(val) => enterLetter(val)} 
        autoCapitalze="characters"
        maxLength={1}
      />
      <Text>Enter second Letter</Text>
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
