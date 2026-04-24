const express = require('express');
const {
  ActivityHandler,
  CloudAdapter,
  ConfigurationServiceClientCredentialFactory,
  createBotFrameworkAuthenticationFromConfiguration
} = require('botbuilder');

const app = express();
app.use(express.json());

// Adapter configuration for both local and Azure deployment
const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: process.env.MicrosoftAppId || '',
  MicrosoftAppPassword: process.env.MicrosoftAppPassword || '',
  MicrosoftAppType: process.env.MicrosoftAppType || 'MultiTenant'
});

const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);
const adapter = new CloudAdapter(botFrameworkAuthentication);

adapter.onTurnError = async (context, error) => {
  console.error('[onTurnError]', error);
  await context.sendActivity('Sorry, an error occurred processing your message.');
};

// Bot class with proper message handling
class EchoBot extends ActivityHandler {
  constructor() {
    super();

    this.onMessage(async (context, next) => {
      const userText = context.activity.text;
      console.log('User said:', userText);
      
      // Send response using Bot Framework's sendActivity
      await context.sendActivity(`You said: ${userText}`);
      
      await next();
    });
  }
}

const bot = new EchoBot();

// Route - properly integrate with Bot Framework
app.post('/api/messages', async (req, res) => {
  console.log('Received message:', JSON.stringify(req.body, null, 2));
  try {
    // Process the message through the adapter and bot
    await adapter.process(req, res, (context) => {
      console.log('Processing context...');
      return bot.run(context);
    });
  } catch (err) {
    console.error('Error processing message:', err);
    res.status(500).send(err.toString());
  }
});

// Simple test endpoint for local development
app.post('/test', async (req, res) => {
  try {
    const userMessage = req.body.text || req.body.message || 'Hello';
    console.log('Test message received:', userMessage);
    
    res.json({
      success: true,
      reply: `You said 🍒: ${userMessage}`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Test endpoint error:', err);
    res.status(500).json({ error: err.toString() });
  }
});

const PORT = process.env.PORT || 3978;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});