
# react-native-datetimepicker

>React Native DateTimePicker component for both Android and iOS, using react-native-picker and Picker.

![demo](./demo.gif 'demo')

## Getting started

`$ npm install react-native-picker --save`

### Mostly automatic installation

`$ react-native link react-native-picker`

### Manual installation

Please read [react-native-picker](https://github.com/beefe/react-native-picker#usage).

## Usage

```javascript
import DatePicker from './src/DatePicker';
```

```javascript
    <DatePicker ref={"datePicker"} hide={true} />
```

```javascript
    this.refs.datePicker.show({
        title: "select a date", //title
        // years: 10, //total years
        // lastYear: 2020, //last year for Picker, must be both to use years
        selectedValue: "2018-12-06", //default date，format "yyyy-MM-dd"
        onPickerConfirm: (chosedDate) => { //confirm callback，format "yyyy-MM-dd"
            //TODO: ...
        },
    });
```
  