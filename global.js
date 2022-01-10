import {StyleSheet, Dimensions,} from 'react-native';

// stylesheets
export const globalStyles = StyleSheet.create({
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
    fontWeight: 'bold',
  },
  item: {
    backgroundColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: 1,
    height: Dimensions.get('window').width / 8,
  },
  itemNav: {
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: 1,
    height: 45,
  },
  itemText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  itemText1: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  message: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    color: 'black',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  messageRow: {
    flex: 1,
  },
  board: {
    flex: 7,
    fontSize: 15,
    fontWeight: 'bold',
    marginVertical: 1,
  },
  itemRed: {
    backgroundColor: 'red',
  },
});
