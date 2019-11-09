/**
 * @flow
 */

import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  Slider,
  TextInput,
  Keyboard
} from "react-native";
import Tts from "react-native-tts";

type Props = {};
export default class App extends Component<Props> {
  state = {
    voices: [],
    ttsStatus: "başlıyor",
    selectedVoice: null,
    speechRate: 0.5,
    speechPitch: 1,
    text: "Selam. Hoş geldiniz. Sağa dönün. Koridoru takip edin.",
    texts : [],
    selectedText:null
  };

  constructor(props) {
    super(props);
    Tts.addEventListener("tts-start", event =>
      this.setState({ ttsStatus: "başladı" })
    );
    Tts.addEventListener("tts-finish", event =>
      this.setState({ ttsStatus: "bitti" })
    );
    Tts.addEventListener("tts-cancel", event =>
      this.setState({ ttsStatus: "iptal edildi" })
    );
    Tts.setDefaultRate(this.state.speechRate);
    Tts.setDefaultPitch(this.state.speechPitch);
    Tts.getInitStatus().then(this.initTts);
  }

  initTts = async () => {
    const voices = await Tts.voices();
    /*const availableVoices = voices
      .filter(v => !v.networkConnectionRequired && !v.notInstalled)
      .map(v => {
        return { id: v.id, name: v.name, language: v.language };
      });
      */
    const texts = [
      {
        id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        title: 'LCW Nerede',
        content: 'Koridoru takip edin. 10 adım ilerleyin. Sağa dönün',
      },
      {
        id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
        title: 'Sinema Nerede',
        content: 'Yürüyen merdivene ilerleyin. Sola dönün. 5 adım ilerleyin.',
      },
      {
        id: '58694a0f-3da1-471f-bd96-145571e29d72',
        title: 'Çıkış Nerede',
        content: 'Asansöre ilerleyin. 3 kat aşağı inin. 15 adım ilerleyin.',
      },
    ];
    

    const availableVoices = voices
    .filter(v => v.name.includes("tr"))
    .map(v => {
      return { id: v.id, name: v.name, language: v.language };
    });
    let selectedVoice = null;
    if (voices && voices.length > 0) {
      selectedVoice = availableVoices[0].id;
      try {
        await Tts.setDefaultLanguage(availableVoices[0].language);
      } catch (err) {
        console.log(`setDefaultLanguage error `, err);
      }
      await Tts.setDefaultVoice(availableVoices[0].id);
      this.setState({
        voices: availableVoices,
        selectedVoice,
        ttsStatus: "initialized"
      });
    } else {
      this.setState({ ttsStatus: "initialized" });
    }

    let selectedText = null;
    if (texts && texts.length > 0) {
      selectedText = texts[0].content;
      this.setState({
        texts: texts,
        selectedText:selectedText
      });
    } 
  };

  readText = async () => {
    Tts.stop();
    Tts.speak(this.state.text);
  };

  setSpeechRate = async rate => {
    await Tts.setDefaultRate(rate);
    this.setState({ speechRate: rate });
  };

  setSpeechPitch = async rate => {
    await Tts.setDefaultPitch(rate);
    this.setState({ speechPitch: rate });
  };

  onVoicePress = async voice => {
    try {
      await Tts.setDefaultLanguage(voice.language);
    } catch (err) {
      console.log(`setDefaultLanguage error `, err);
    }
    await Tts.setDefaultVoice(voice.id);
    this.setState({ selectedVoice: voice.id });
  };

  onTextPress = async text => {
    try {
      this.setState({text:text,selectedText:text});
    } catch (err) {
      console.log(`error `, err);
    }
  };

  renderVoiceItem = ({ item }) => {
    return (
      <Button
        title={`${item.language} - ${item.name || item.id}`}
        color={this.state.selectedVoice === item.id ? undefined : "#969696"}
        onPress={() => this.onVoicePress(item)}
      />
    );
  };

  renderTextItem = ({ item }) => {
    return (
      <Button
        title={`${item.title}`}
        color={this.state.selectedText === item.id ? undefined : "#969696"}
        onPress={() => this.onTextPress(item.content)}
      />
    );
  };

  render() {
    /*
     *       React Native TTS Example
     *             |Read text|
     *           Status: ready
     *    Selected Voice: com.apple....
     *      Speed: 0.50   ------o------
     *      Pitch: 1.00   -----o-------
     *  ________________________________
     * | This is an example text        |
     * |                                |
     * |________________________________|
     *           |de-DE - Anna|
     *          |en-GB - Arthur|
     *           |it-IT - Alice|
     */
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{`Text To Speech`}</Text>

        <Button title={`Yazıyı Oku`} onPress={this.readText} />

        <Text style={styles.label}>{`Durum: ${this.state.ttsStatus ||
          ""}`}</Text>

        <Text style={styles.label}>{`Seçilen Ses: ${this.state
          .selectedVoice || ""}`}</Text>

        <View style={styles.sliderContainer}>
          <Text
            style={styles.sliderLabel}
          >{`Hız: ${this.state.speechRate.toFixed(2)}`}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0.01}
            maximumValue={0.99}
            value={this.state.speechRate}
            onSlidingComplete={this.setSpeechRate}
          />
        </View>

        <View style={styles.sliderContainer}>
          <Text
            style={styles.sliderLabel}
          >{`Yükseklik: ${this.state.speechPitch.toFixed(2)}`}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={2}
            value={this.state.speechPitch}
            onSlidingComplete={this.setSpeechPitch}
          />
        </View>

        <TextInput
          style={styles.textInput}
          multiline={true}
          onChangeText={text => this.setState({ text })}
          value={this.state.text}
          onSubmitEditing={Keyboard.dismiss}
        />

        <FlatList
          keyExtractor={item => item.id}
          renderItem={this.renderTextItem}
          extraData={this.state.selectedText}
          data={this.state.texts}
        />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 26,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  label: {
    textAlign: "center"
  },
  sliderContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  sliderLabel: {
    textAlign: "center",
    marginRight: 20
  },
  slider: {
    width: 150
  },
  textInput: {
    borderColor: "gray",
    borderWidth: 1,
    flex: 1,
    width: "100%"
  }
});
