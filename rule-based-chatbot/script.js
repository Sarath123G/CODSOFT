document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // Focus input field on load
    userInput.focus();

    function formatTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-message slide-in`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-timestamp';
        timeDiv.textContent = formatTime();

        msgDiv.appendChild(contentDiv);
        msgDiv.appendChild(timeDiv);
        
        chatBox.appendChild(msgDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator slide-in';
        typingDiv.id = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            typingDiv.appendChild(dot);
        }
        
        chatBox.appendChild(typingDiv);
        scrollToBottom();
    }

    function hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    function scrollToBottom() {
        chatBox.scrollTo({
            top: chatBox.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Rule-based logic with Real-time API Integration
    async function getBotResponse(input) {
        input = input.toLowerCase().trim();

        try {
            // Weather API using geolocation or specific city
            if (/\b(weather|temperature)\b/.test(input)) {
                let latitude, longitude, city;
                
                const cityMatch = input.match(/in\s+([a-z\s]+)/);
                let searchedCity = cityMatch ? cityMatch[1].trim() : null;
                
                if (searchedCity && searchedCity !== 'my location') {
                    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchedCity)}`);
                    const geoData = await geoResponse.json();
                    if (geoData.results && geoData.results.length > 0) {
                        geoData.results.sort((a, b) => (b.population || 0) - (a.population || 0));
                        latitude = geoData.results[0].latitude;
                        longitude = geoData.results[0].longitude;
                        city = `${geoData.results[0].name}, ${geoData.results[0].country}`;
                    }
                }

                if (!latitude || !longitude) {
                    try {
                        const position = await new Promise((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                        });
                        latitude = position.coords.latitude;
                        longitude = position.coords.longitude;
                        
                        const reverseGeoResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                        const reverseGeoData = await reverseGeoResponse.json();
                        city = reverseGeoData.city || reverseGeoData.locality || "your location";
                    } catch (e) {
                        const geoResponse = await fetch('https://get.geojs.io/v1/ip/geo.json', { cache: 'no-store' });
                        const geo = await geoResponse.json();
                        latitude = geo.latitude;
                        longitude = geo.longitude;
                        city = geo.city;
                    }
                }

                const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m`, { cache: 'no-store' });
                const weatherData = await weatherResponse.json();
                return `Currently in ${city}, it's ${weatherData.current.temperature_2m}°C with wind speeds of ${weatherData.current.wind_speed_10m} km/h.`;
            }

            // Real-time General News API
            if (/\b(news|headline|current events)\b/.test(input)) {
                const newsResponse = await fetch('https://api.rss2json.com/v1/api.json?rss_url=http://feeds.bbci.co.uk/news/rss.xml');
                const newsData = await newsResponse.json();
                const topArticle = newsData.items[0];
                return `Here is a top news headline right now: "${topArticle.title}"`;
            }

            // Real-time Joke API
            if (/\b(joke|funny|make me laugh)\b/.test(input)) {
                const jokeResponse = await fetch('https://v2.jokeapi.dev/joke/Misc,Pun?safe-mode', { cache: 'no-store' });
                const jokeData = await jokeResponse.json();
                
                if (jokeData.type === 'twopart') {
                    return `${jokeData.setup} ... ${jokeData.delivery}`;
                } else if (jokeData.type === 'single') {
                    return jokeData.joke;
                }
                return "Why don't skeletons fight each other? They don't have the guts.";
            }
            
            // Real-time Random Fact API
            if (/\b(fact|trivia|interesting)\b/.test(input)) {
                const factResponse = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random');
                const fact = await factResponse.json();
                return fact.text;
            }

        } catch (error) {
            console.error("API Error:", error);
            // Fallback if APIs fail but rule matches
            if (/\b(weather)\b/.test(input)) return "I couldn't fetch the live weather right now, but I hope it's sunny!";
            if (/\b(news)\b/.test(input)) return "I'm having trouble connecting to the news feed at the moment.";
            if (/\b(joke)\b/.test(input)) return "Why did the scarecrow win an award? Because he was outstanding in his field!";
        }

        // Standard predefined rules for everything else
        const rules = [
            {
                pattern: /^(hi|hello|hey|greetings|howdy)( there)?\b/,
                responses: ["Hello! It's great to meet you. How can I assist you today?", "Hi there! I'm Aura. What's on your mind?", "Hey! Hope you're having a wonderful day. Need any help?"]
            },
            {
                pattern: /^how are you\b/,
                responses: ["I'm just a bundle of code, but I'm doing fantastically! Thanks for asking.", "Operating at 100% efficiency and feeling great!", "I don't have feelings, but I'm ready to help you!"]
            },
            {
                pattern: /\b(what is your name|who are you)\b/,
                responses: ["I'm Aura, a simple rule-based AI chatbot built to demonstrate natural language processing concepts.", "My name is Aura! I'm an intelligent interface designed to chat with you."]
            },
            {
                pattern: /\b(what can you do|help)\b/,
                responses: ["I can answer basic questions, check live weather, grab the top news headline, or tell you a joke! Try asking 'What's the weather' or 'Tell me a fact'."]
            },
            {
                pattern: /\b(time|date)\b/,
                responses: [`The current local time is ${formatTime()}.`]
            },
            {
                pattern: /\b(thank you|thanks)\b/,
                responses: ["You're very welcome!", "Happy to help!", "Anytime!"]
            },
            {
                pattern: /\b(bye|goodbye|see ya|farewell)\b/,
                responses: ["Goodbye! Have a great day!", "See you later! Feel free to chat again.", "Farewell! Stay awesome."]
            }
        ];

        // Match input against standard rules
        for (let rule of rules) {
            if (rule.pattern.test(input)) {
                return rule.responses[Math.floor(Math.random() * rule.responses.length)];
            }
        }

        // Fallback response
        const fallbacks = [
            "I'm not quite sure I understand that. Try asking me for the weather, news, or a random fact!",
            "Interesting... tell me more!",
            "As a simple bot, I don't have a response for that yet. Try asking me for a joke!",
            "I don't compute! I'm still learning. Try saying 'help' to see what I can do."
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    async function handleUserInput() {
        const text = userInput.value.trim();
        if (!text) return;

        // 1. Show user message
        appendMessage(text, 'user');
        userInput.value = '';

        // 2. Show typing indicator
        showTypingIndicator();

        // 3. Process bot response asynchronously
        const response = await getBotResponse(text);
        
        // Add a slight artificial delay if the API was too fast, for realism
        setTimeout(() => {
            hideTypingIndicator();
            appendMessage(response, 'bot');
        }, 500 + Math.random() * 500); 
    }

    sendBtn.addEventListener('click', handleUserInput);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserInput();
        }
    });
});
