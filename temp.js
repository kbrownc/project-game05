
// 1) addd after let j;

return getHighScores().then((highScores) =>  {
      all the code from here down
  }


// 2)
// Enter a Letter from keyboard
  // - calls enterLetterLogic which has detailed logic
  const enterLetter = useCallback((value, item) => {
    enterLetterLogic(value, item, prevGameState.board).then((eLL) => {
    setGameState(prevGameState => {
      return {
        ...prevGameState,
        message: eLL.message,
        score: eLL.score,
        board: eLL.board,
        previousBoard: eLL.previousBoard,
      };
    });
    })
  }, []);