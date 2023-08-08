const {
  TeamsActivityHandler,
  CardFactory,
  TurnContext,
} = require("botbuilder");
const rawWelcomeCard = require("./adaptiveCards/welcome.json");
const rawLearnCard = require("./adaptiveCards/learn.json");
const cardTools = require("@microsoft/adaptivecards-tools");
const { OpenAIApi, Configuration } = require("openai");
const config = require("./config");

class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    const configuration = new Configuration({
      apiKey: config.openaiKey,
    });
    const openai = new OpenAIApi(configuration);

  async function runCompletion(txt, context) {
    console.log("Running completion");
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: txt,
      max_tokens:4000
      });
    await context.sendActivity(completion.data.choices[0].text + "\n\n" + `Tokens gastos na resposta: ${completion.data.usage.total_tokens}`);
  }

    // record the likeCount
    this.likeCountObj = { likeCount: 0 };

    this.onMessage(async (context, next) => {
      console.log("Running with Message Activity.");
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
          console.log("key: ->" + config.openaiKey + "\n\n");   
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