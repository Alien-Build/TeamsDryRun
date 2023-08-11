const {
  TeamsActivityHandler,
  CardFactory,
  TurnContext,
} = require("botbuilder");
const rawWelcomeCard = require("./adaptiveCards/welcome.json");
const rawLearnCard = require("./adaptiveCards/learn.json");
const cardTools = require("@microsoft/adaptivecards-tools");
const config = require("./config");
const message = require("./entities/message");
const history = require("./entities/historyHandler");
const authentication = require("./entities/authenticate");

class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

  async function runCompletion(txt, context) {
    console.log("Running completion");
    history.add.message("user", txt);

    const completion = await fetch("https://tvt-app-athenav2-eu-prd.azurewebsites.net/chat/completions", {
      method: "post",
      headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token.access_token,
      },
      body: JSON.stringify(HistoryHandler),
      })
      .then((response) => response.json())
      .then((data) => {
          console.log("success: ",data);
          HistoryHandler.add.message("assistant", data.choices[0].message.content)
      })
      .catch((error) => {
          console.log(error);
      });
    await context.sendActivity(completion.choices[0].message.content);
  }

    // record the likeCount
    this.likeCountObj = { likeCount: 0 };

    this.onMessage(async (context, next) => {
      console.log("Running with message Activity.");
      let txt = context.activity.text;
      const removedMentionText = TurnContext.removeRecipientMention(
        context.activity
      );
      if (removedMentionText) {
        // Remove the line break
        txt = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();
      }

      // Trigger command by IM text
      switch (txt) {
        case "oi": {
          await context.sendActivity(`Olá!`);
        }
        case "welcome": {
          const card =
            cardTools.AdaptiveCards.declareWithoutData(rawWelcomeCard).render();
          await context.sendActivity({
            attachments: [CardFactory.adaptiveCard(card)],
          });
          break;
        }
        case "learn": {
          this.likeCountObj.likeCount = 0;
          const card = cardTools.AdaptiveCards.declare(rawLearnCard).render(
            this.likeCountObj
          );
          await context.sendActivity({
            attachments: [CardFactory.adaptiveCard(card)],
          });
          break;
        }
        default: {
          console.log("Running with default case." + "\n\n");
          console.log("text from user: " + txt + "\n\n");
          console.log("User: " + context.activity.from.name + "\n\n");
          console.log("User ID: " + context.activity.from.id + "\n\n");
          await runCompletion(txt, context);
          break;
        }
      }

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });

    // Listen to MembersAdded event, view https://docs.microsoft.com/en-us/microsoftteams/platform/resources/bot-v3/bots-notifications for more events
    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (const element of membersAdded) {
        if (element.id) {
          const card =
            cardTools.AdaptiveCards.declareWithoutData(rawWelcomeCard).render();
          await context.sendActivity({
            attachments: [CardFactory.adaptiveCard(card)],
          });
          break;
        }
      }
      await next();
    });
  }

  // Invoked when an action is taken on an Adaptive Card. The Adaptive Card sends an event to the Bot and this
  // method handles that event.
  async onAdaptiveCardInvoke(context, invokeValue) {
    // The verb "userlike" is sent from the Adaptive Card defined in adaptiveCards/learn.json
    if (invokeValue.action.verb === "userlike") {
      this.likeCountObj.likeCount++;
      const card = cardTools.AdaptiveCards.declare(rawLearnCard).render(
        this.likeCountObj
      );
      await context.updateActivity({
        type: "message",
        id: context.activity.replyToId,
        attachments: [CardFactory.adaptiveCard(card)],
      });
      return { statusCode: 200 };
    }
  }
}

module.exports.TeamsBot = TeamsBot;
