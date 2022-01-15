import {StyleSheet, Dimensions,} from 'react-native';

// stylesheets
export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
  },
  nav: {
    flex: .5,
    fontWeight: 'bold',
    flexDirection: 'row',
    justifyContent: 'space-between',
    textAlignVertical: 'center',
    margin: 1,
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
    flex: 1,
    backgroundColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: 1,
    height: Dimensions.get('window').width / 8,
  },
  itemNav: {
    flex: 1,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: 2,
    height: 35,
    textAlignVertical: 'center',
  },
  itemText: {
    flex: 1,
    alignItems: 'center',
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
    textAlignVertical: 'center',
  },
  itemText1: {
    color: '#fff',
    fontSize: 15,
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
    textAlignVertical: 'center',
  },
  messageRow: {
    flex: 1,
  },
  board: {
    flex: 7,
    fontWeight: 'bold',
    marginVertical: 0,
  },
  itemRed: {
    backgroundColor: 'red',
  },
});
