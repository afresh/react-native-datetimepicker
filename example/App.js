/**
 * RNDateTimePicker
 * https://github.com/afresh/react-native-datetimepicker
 *
 * @afresh
 * 2018-12-05
 */

import React, {Component} from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';

import DatePicker from './src/DatePicker';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            date: "2018-12-05",
        };
    }

    _showDatePicker = () => {
        this.refs.datePicker.show({
            title: "请选择日期", //标题
            // years: 10, //展示总年数
            // lastYear: 2020, //展示最后一年，须同时传years
            selectedValue: this.state.date, //默认选择的日期，格式"yyyy-MM-dd"
            onPickerConfirm: (chosedDate) => { //确认回调，格式"yyyy-MM-dd"
                this.setState({
                    date: chosedDate,
                });
            },
        });
    };

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.button} onPress={() => this._showDatePicker()}>
                    <Text style={styles.date}>选择日期：{this.state.date}</Text>
                </TouchableOpacity>
                <DatePicker ref={"datePicker"} hide={true} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    button: {
        width: 300,
        height: 44,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F66262',
    },
    date: {
        textAlign: 'center',
        fontSize: 18,
        color: '#FFFFFF',
    },
});
