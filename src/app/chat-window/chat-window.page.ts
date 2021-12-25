import { Component } from '@angular/core';
import { DetectDominantLanguageCommand } from '@aws-sdk/client-comprehend';
import { TranslateTextCommand } from '@aws-sdk/client-translate';
import { RecognizeTextCommand } from '@aws-sdk/client-lex-runtime-v2';
import { lexClient } from './libs/lexClient.service';
import { translateClient } from './libs/translateClient.service';
import { comprehendClient } from './libs/comprehendClient.service';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.page.html',
  styleUrls: ['./chat-window.page.scss'],
})
export class ChatWindowPage {
  gText = '';
  isOpen = false;
  isEnabled = false;
  showRequest(gText: string) {
    const conversationDiv = document.getElementById('conversation');
    const requestPara = document.createElement('p');
    requestPara.className += 'userRequest';
    requestPara.appendChild(document.createTextNode(gText));
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    let hour = '';
    let minute = '';
    if (hours < 10) {
      hour = '0'+hours.toString();
    }  else {
      hour = hours.toString();
    }
    if (minutes < 10) {
      minute = '0'+minutes.toString();
    } else {
      minute = minutes.toString();
    }
    const sendTime = document.createElement('p');
    sendTime.className += 'userTime';
    sendTime.appendChild(document.createTextNode('Sent, ' + hour + ':' + minute));

    const timeDiv = document.createElement('div');
    timeDiv.className += 'time-div';
    timeDiv.appendChild(sendTime);

    const requestDiv = document.createElement('div');
    requestDiv.className += 'user-chat-div';
    requestDiv.appendChild(requestPara);

    if (conversationDiv !== null) {
      conversationDiv.appendChild(requestDiv);
      conversationDiv.appendChild(timeDiv);
      conversationDiv.scrollTop = conversationDiv.scrollHeight;
    }
  }
  showResponse(lexResponse: string) {
    const conversationDiv = document.getElementById('conversation');
    const responsePara = document.createElement('p');
    responsePara.className += 'lexResponse';
    const lexTextResponse = lexResponse;
    responsePara.appendChild(document.createTextNode(lexTextResponse));
    responsePara.appendChild(document.createElement('br'));

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    let hour = '';
    let minute = '';
    if (hours < 10) {
      hour = '0'+hours.toString();
    }  else {
      hour = hours.toString();
    }
    if (minutes < 10) {
      minute = '0'+minutes.toString();
    } else {
      minute = minutes.toString();
    }
    const sendTime = document.createElement('p');
    sendTime.className += 'lexTime';
    sendTime.appendChild(document.createTextNode('Responded, ' + hour + ':' + minute));

    const timeDiv = document.createElement('div');
    timeDiv.className += 'time-div';
    timeDiv.appendChild(sendTime);

    const responseDiv = document.createElement('div');
    responseDiv.className += 'lex-chat-div';
    responseDiv.appendChild(responsePara);

    if (conversationDiv !== null) {
      conversationDiv.appendChild(responseDiv);
      conversationDiv.appendChild(timeDiv);
      conversationDiv.scrollTop = conversationDiv.scrollHeight;
    }
    this.isEnabled = false;
  }
  async createResponse() {
    // Confirm there is text to submit.
    const wisdomText = document.getElementById('wisdom') as HTMLInputElement;
    if (wisdomText && wisdomText.value && wisdomText.value.trim().length > 0) {
      // Disable input to show it is being sent.
      const wisdom = wisdomText.value.trim();
      wisdomText.value = '';
      // wisdomText.locked = true;
      this.isEnabled = true;
      const comprehendParams = {
        Text: wisdom,
      };
      try {
        const data = await comprehendClient.send(
          new DetectDominantLanguageCommand(comprehendParams)
        );
        if (data?.Languages != null) {
          console.log(
            'Success. The language code is: ',
            data.Languages[0].LanguageCode
          );

          const translateParams = {
            SourceLanguageCode: data.Languages[0].LanguageCode,
            TargetLanguageCode: 'en', // For example, "en" for English.
            Text: wisdom,
          };

          const translated = await translateClient.send(
            new TranslateTextCommand(translateParams)
          );
          console.log('Success. Translated text: ', translated.TranslatedText);
          this.showRequest(translated.TranslatedText as string);
          const lexParams = {
            botAliasId: 'TSTALIASID',
            botId: 'X8A3RPXYAD',
            localeId: 'en_US',
            text: translated.TranslatedText,
            sessionId: 'session-id', // For example, 'session-id'.
          };

          try {
            const response = await lexClient.send(new RecognizeTextCommand(lexParams));

            if (response?.messages != null) {
              console.log('Success. Response is: ', response.messages[0].content);

              const msg = response.messages[0].content;
              this.showResponse(msg as string);
            }
          } catch (err) {
            console.log('Error responding to message. ', err);
          }
        }
      } catch (err) {
        console.log('Error translating text / identifying language. ', err);
      }
    }
  };
  detectEnter() {
    this.createResponse();
  };
}
