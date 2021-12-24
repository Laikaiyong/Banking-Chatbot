import { Component } from '@angular/core';
import { DetectDominantLanguageCommand } from "@aws-sdk/client-comprehend";
import { TranslateTextCommand } from "@aws-sdk/client-translate";
import { RecognizeTextCommand } from "@aws-sdk/client-lex-runtime-v2";
import { lexClient } from "./libs/lexClient.service";
import { translateClient } from "./libs/translateClient.service";
import { comprehendClient } from "./libs/comprehendClient.service";
import { request } from 'http';
import { time } from 'console';

@Component({
  selector: 'chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})

export class ChatbotComponent{
  g_text : string = "";
  isOpen : boolean = true;
  isEnabled: boolean = false;
  
  showRequest(g_text: string) {
    var conversationDiv = document.getElementById("conversation");
    var requestPara = document.createElement('p');
    requestPara.className += "userRequest";
    requestPara.appendChild(document.createTextNode(g_text));
    
    const now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var hour, minute;
    if (hours < 10)  hour = '0'+hours.toString(); else hour = hours.toString();
    if (minutes < 10)  minute = '0'+minutes.toString(); else minute = minutes.toString();
    var sendTime = document.createElement('p');
    sendTime.className += "userTime";
    sendTime.appendChild(document.createTextNode("Sent, " + hour + ":" + minute));

    var timeDiv = document.createElement('div');
    timeDiv.className += "time-div";
    timeDiv.appendChild(sendTime);

    var requestDiv = document.createElement('div');
    requestDiv.className += "chat-div";
    requestDiv.appendChild(requestPara);

    if (conversationDiv !== null) {
      conversationDiv.appendChild(requestDiv);
      conversationDiv.appendChild(timeDiv);
      conversationDiv.scrollTop = conversationDiv.scrollHeight;
    }
  }
  
  showResponse(lexResponse : string) {
    var conversationDiv = document.getElementById("conversation");
    var responsePara = document.createElement("P");
    responsePara.className += "lexResponse";
  
    var lexTextResponse = lexResponse;
  
    responsePara.appendChild(document.createTextNode(lexTextResponse));
    responsePara.appendChild(document.createElement("br"));

    const now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var hour, minute;
    if (hours < 10)  hour = '0'+hours.toString(); else hour = hours.toString();
    if (minutes < 10)  minute = '0'+minutes.toString(); else minute = minutes.toString();
    var sendTime = document.createElement('p');
    sendTime.className += "lexTime";
    sendTime.appendChild(document.createTextNode("Responded, " + hour + ":" + minute));

    var timeDiv = document.createElement('div');
    timeDiv.className += "time-div";
    timeDiv.appendChild(sendTime);

    var responseDiv = document.createElement('div');
    responseDiv.className += "chat-div";
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
    var wisdomText = (<HTMLInputElement> document.getElementById("wisdom"));
    if (wisdomText && wisdomText.value && wisdomText.value.trim().length > 0) {
      // Disable input to show it is being sent.
      var wisdom = wisdomText.value.trim();
      wisdomText.value = "";
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
            "Success. The language code is: ",
            data.Languages[0].LanguageCode
          );

          const translateParams = {
            SourceLanguageCode: data.Languages[0].LanguageCode,
            TargetLanguageCode: "en", // For example, "en" for English.
            Text: wisdom,
          };

          const translated = await translateClient.send(
            new TranslateTextCommand(translateParams)
          );
          console.log("Success. Translated text: ", translated.TranslatedText);
          this.showRequest(translated.TranslatedText as string);
          const lexParams = {
            botAliasId: "TSTALIASID",
            botId: "X8A3RPXYAD",
            localeId: "en_US",
            text: translated.TranslatedText,
            sessionId: "session-id", // For example, 'session-id'.
          };

          try {
            const data = await lexClient.send(new RecognizeTextCommand(lexParams));

            if (data?.messages != null) {
              console.log("Success. Response is: ", data.messages[0]['content']);

              var msg = data.messages[0]['content'];
              this.showResponse(msg as string);
            }
          } catch (err) {
            console.log("Error responding to message. ", err);
          }
        }
      } catch (err) {
        console.log("Error translating text / identifying language. ", err);
      }
    }
  };
  
  detectEnter() {
    this.createResponse();
  };
}
