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
