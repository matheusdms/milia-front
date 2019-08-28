import React, { Component } from 'react'
import { GiftedChat } from 'react-native-gifted-chat'
import { View, Text } from 'react-native'
import MiliaService from '../../services/api';
import styles from './styles';
import Geolocation from '@react-native-community/geolocation';

class Dashboard extends Component {
  state = {
    messages: [],
    typingText: '',
    initialPosition: '',
    lastPosition: '',
  }

  watchID = null;

  miliaService = new MiliaService();

  renderFooter = () => {
    if (this.state.typingText) {
      return (
        <View>
          <Text style={styles.footerText}>{this.state.typingText}</Text>
        </View>
      )
    }
    return null;
  }

  componentWillMount() {
    this.watchID != null && Geolocation.clearWatch(this.watchID);
  }

  componentDidMount() {
    Geolocation.getCurrentPosition(
      position => {
        const initialPosition = JSON.stringify(position);
        this.setState({initialPosition});
      },
      error => Alert.alert('Error', JSON.stringify(error)),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
    this.watchID = Geolocation.watchPosition(position => {
      const lastPosition = JSON.stringify(position);
      this.setState({lastPosition});
    });
    
    this.setState({
      messages: [
        {
          _id: 1,
          text: 'Hello developer',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'Milia',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
      ],
    });
  }

  async onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages)
    }));

    const paramsUser = {
      lastPosition: this.state.lastPosition,
    };

    this.setState({typingText: 'Milia está digitando...'});
    const result = await this.miliaService.askMilia(messages[0].text, paramsUser);

    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, result.data.dialogflowResult),
      typingText: ''
    }));
  }

  render() {
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={messages => this.onSend(messages)}
        user={{
          _id: 1,
        }}
        renderFooter={this.renderFooter}
      />
    )
  }
};

export default Dashboard;