import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/* ──────────────────────────────────────────────────────────
   MedBot — Self-contained AI Health Chatbot
   Uses keyword matching + a rich medical knowledge base.
   No external API needed — runs entirely in the browser.
   ────────────────────────────────────────────────────────── */

// ── Medical Knowledge Base ──────────────────────────────
const medicalKB = [
  {
    keywords: ['headache', 'head pain', 'head ache', 'migraine', 'head hurts'],
    response: `🧠 **Headache / Migraine Tips:**\n\n• Stay hydrated — drink at least 8 glasses of water a day.\n• Rest in a quiet, dark room and close your eyes for 15–20 minutes.\n• Apply a cold or warm compress to your forehead or neck.\n• Avoid bright screens and loud noises.\n• Try gentle neck stretches and deep breathing.\n\n⚠️ **See a doctor if:** headaches are frequent, very severe, or come with vision changes, confusion, or fever.`
  },
  {
    keywords: ['fever', 'high temperature', 'chills', 'feeling hot'],
    response: `🌡️ **Fever Management:**\n\n• Rest as much as possible — your body is fighting an infection.\n• Drink plenty of fluids (water, soups, herbal teas).\n• Use a cool, damp cloth on your forehead.\n• Wear light, comfortable clothing.\n• Eat light, nutritious meals even if your appetite is low.\n\n⚠️ **See a doctor if:** fever exceeds 103°F (39.4°C), lasts more than 3 days, or comes with stiff neck, rash, or difficulty breathing.`
  },
  {
    keywords: ['cold', 'cough', 'runny nose', 'sore throat', 'congestion', 'sneezing', 'flu', 'influenza'],
    response: `🤧 **Cold & Flu Relief:**\n\n• Get plenty of rest and sleep.\n• Stay hydrated with warm fluids — tea with honey, warm water with lemon.\n• Gargle with warm salt water for a sore throat.\n• Use steam inhalation to relieve congestion.\n• Eat vitamin C-rich foods (oranges, lemons, bell peppers).\n\n⚠️ **See a doctor if:** symptoms last more than 10 days, you have difficulty breathing, or feel chest pain.`
  },
  {
    keywords: ['stomach', 'nausea', 'vomiting', 'stomach ache', 'belly', 'abdominal pain', 'indigestion', 'gastric'],
    response: `🤢 **Stomach & Digestive Issues:**\n\n• Eat small, bland meals — rice, bananas, toast, applesauce (the BRAT diet).\n• Sip ginger tea or peppermint tea to ease nausea.\n• Avoid spicy, fried, and fatty foods.\n• Stay hydrated with clear fluids.\n• Avoid lying down immediately after eating.\n\n⚠️ **See a doctor if:** you have severe pain, blood in vomit or stool, or symptoms last more than 48 hours.`
  },
  {
    keywords: ['diarrhea', 'loose stool', 'loose motion', 'watery stool'],
    response: `💧 **Diarrhea Management:**\n\n• Drink ORS (Oral Rehydration Solution) or plenty of water to prevent dehydration.\n• Eat the BRAT diet: Bananas, Rice, Applesauce, Toast.\n• Avoid dairy, caffeine, and high-fiber foods temporarily.\n• Wash hands frequently to prevent spreading.\n• Rest and allow your body to recover.\n\n⚠️ **See a doctor if:** diarrhea lasts more than 2 days, you see blood, or feel very dehydrated (dry mouth, dizziness).`
  },
  {
    keywords: ['back pain', 'back ache', 'lower back', 'spine', 'back hurts'],
    response: `🦴 **Back Pain Relief:**\n\n• Apply ice for the first 48 hours, then switch to heat therapy.\n• Maintain good posture — sit straight and support your lower back.\n• Do gentle stretches and short walks (avoid bed rest for too long).\n• Sleep on a firm mattress with a pillow between your knees.\n• Strengthen your core muscles with light exercises.\n\n⚠️ **See a doctor if:** pain radiates down your legs, you feel numbness or tingling, or pain worsens over time.`
  },
  {
    keywords: ['anxiety', 'stress', 'worried', 'panic', 'nervous', 'anxious', 'tension', 'overwhelm'],
    response: `🧘 **Anxiety & Stress Management:**\n\n• Practice deep breathing: inhale 4 sec → hold 4 sec → exhale 6 sec.\n• Try the 5-4-3-2-1 grounding technique (notice 5 things you see, 4 you touch, etc.)\n• Take a short walk in nature or fresh air.\n• Limit caffeine and social media.\n• Talk to someone you trust about how you feel.\n• Maintain a regular sleep schedule.\n\n⚠️ **See a professional if:** anxiety interferes with daily life for more than 2 weeks.`
  },
  {
    keywords: ['sleep', 'insomnia', 'cant sleep', 'sleepless', 'trouble sleeping', 'restless'],
    response: `😴 **Better Sleep Tips:**\n\n• Keep a consistent sleep schedule — same bedtime and wake time daily.\n• Avoid screens (phone, TV) at least 1 hour before bed.\n• Make your room dark, cool, and quiet.\n• Avoid caffeine after 2 PM and heavy meals before bed.\n• Try relaxation techniques like reading, gentle stretching, or meditation.\n• Limit naps to 20–30 minutes during the day.\n\n⚠️ **See a doctor if:** insomnia persists for more than 4 weeks.`
  },
  {
    keywords: ['diabetes', 'blood sugar', 'sugar level', 'insulin', 'diabetic'],
    response: `🩸 **Diabetes Management Tips:**\n\n• Monitor your blood sugar levels regularly as advised.\n• Eat a balanced diet rich in fiber, vegetables, and whole grains.\n• Avoid sugary drinks, refined carbs, and processed foods.\n• Exercise for at least 30 minutes daily (walking, cycling).\n• Take medications on time as prescribed.\n• Stay hydrated and manage stress.\n\n⚠️ **See a doctor immediately if:** you experience extreme thirst, frequent urination, blurred vision, or unexplained weight loss.`
  },
  {
    keywords: ['blood pressure', 'bp', 'hypertension', 'high bp', 'low bp'],
    response: `❤️ **Blood Pressure Management:**\n\n• Reduce salt intake (aim for less than 5g/day).\n• Eat potassium-rich foods: bananas, spinach, sweet potatoes.\n• Exercise regularly — brisk walking for 30 min/day.\n• Limit alcohol and quit smoking.\n• Manage stress through meditation or deep breathing.\n• Monitor your BP regularly at home.\n\n⚠️ **See a doctor if:** BP readings are consistently above 140/90 or below 90/60, or you feel dizziness, chest pain, or shortness of breath.`
  },
  {
    keywords: ['allergy', 'allergic', 'rash', 'hives', 'itching', 'itchy', 'skin rash'],
    response: `🤧 **Allergy & Skin Rash Tips:**\n\n• Identify and avoid the allergen (food, pollen, dust, medication).\n• Apply cool compresses to itchy areas.\n• Wear loose, soft cotton clothing.\n• Keep skin moisturized with gentle, fragrance-free lotions.\n• Avoid scratching — trim nails short.\n• Keep your living space clean and dust-free.\n\n⚠️ **See a doctor immediately if:** you have swelling of face/throat, difficulty breathing, or a widespread rash after taking medicine.`
  },
  {
    keywords: ['joint pain', 'arthritis', 'knee pain', 'joint', 'swollen joint', 'stiff joints'],
    response: `🦵 **Joint Pain & Arthritis Tips:**\n\n• Apply warm compresses to stiff joints in the morning.\n• Do gentle range-of-motion exercises daily.\n• Maintain a healthy weight to reduce stress on joints.\n• Include anti-inflammatory foods: fish, turmeric, ginger, berries.\n• Use supportive footwear and avoid prolonged standing.\n• Stay active — swimming and cycling are joint-friendly exercises.\n\n⚠️ **See a doctor if:** joints are red, hot, and swollen, pain is severe, or movement becomes very limited.`
  },
  {
    keywords: ['chest pain', 'heart', 'palpitation', 'chest tightness', 'heart attack'],
    response: `🚨 **Chest Pain — Take This Seriously!**\n\n• **If you are experiencing chest pain right now, please call emergency services (911 / 112) immediately.**\n• Sit down and rest — do not exert yourself.\n• Loosen any tight clothing.\n• If prescribed, take your heart medication.\n• Try to stay calm and take slow, deep breaths.\n\n⚠️ **Always seek emergency help if:** chest pain comes with shortness of breath, arm/jaw pain, sweating, or dizziness. Never ignore these symptoms.`
  },
  {
    keywords: ['tired', 'fatigue', 'exhausted', 'no energy', 'weak', 'lethargy', 'weakness'],
    response: `😩 **Fatigue & Low Energy Tips:**\n\n• Ensure you're getting 7–9 hours of quality sleep.\n• Stay hydrated — dehydration is a common cause of fatigue.\n• Eat balanced meals with iron-rich foods (spinach, lentils, eggs).\n• Exercise lightly — even a 20-minute walk boosts energy.\n• Reduce stress and take breaks during work.\n• Limit caffeine and sugar — they cause energy crashes.\n\n⚠️ **See a doctor if:** fatigue persists for more than 2 weeks, or comes with unexplained weight loss, fever, or pain.`
  },
  {
    keywords: ['medicine', 'medication', 'pill', 'tablet', 'dose', 'drug', 'forgot medicine', 'missed dose', 'when to take', 'after meal', 'before meal', 'before food', 'after food'],
    response: `💊 **Medicine & Dosage Tips:**\n\n• Always take medicines at the time prescribed by your doctor.\n• If you missed a dose, take it as soon as you remember — but skip it if it's almost time for the next dose. Never double up.\n• Some medicines work better on an empty stomach, others with food — check the label or ask your pharmacist.\n• Store medicines in a cool, dry place away from sunlight.\n• Use your MedReminder schedule to set alerts!\n• Never share prescription medicines with others.\n\n⚠️ **Always consult your doctor** before stopping or changing any medication.`
  },
  {
    keywords: ['diet', 'nutrition', 'food', 'eat', 'healthy food', 'what to eat', 'weight loss', 'weight gain'],
    response: `🥗 **Healthy Diet Tips:**\n\n• Eat a variety of fruits and vegetables daily (aim for 5 servings).\n• Choose whole grains over refined grains (brown rice, whole wheat).\n• Include lean proteins: chicken, fish, beans, lentils, eggs.\n• Limit added sugars, salt, and saturated fats.\n• Eat smaller, more frequent meals instead of 3 large ones.\n• Stay hydrated — water is the best drink!\n• Avoid processed and packaged foods when possible.\n\n💡 **A good rule:** fill half your plate with vegetables, a quarter with protein, and a quarter with whole grains.`
  },
  {
    keywords: ['exercise', 'workout', 'physical activity', 'fitness', 'walk', 'yoga'],
    response: `🏃 **Exercise & Fitness Tips:**\n\n• Aim for at least 30 minutes of moderate exercise daily.\n• Start slow if you're new — a 15-minute walk is a great start!\n• Mix cardio (walking, cycling) with light strength training.\n• Yoga and stretching improve flexibility and reduce stress.\n• Stay consistent — regular, light exercise beats occasional intense workouts.\n• Warm up before exercise and cool down after.\n\n⚠️ **Important:** consult your doctor before starting a new exercise routine, especially if you have heart, joint, or breathing conditions.`
  },
  {
    keywords: ['alzheimer', 'dementia', 'memory loss', 'forgetful', 'memory', 'cognitive'],
    response: `🧠 **Alzheimer's & Memory Support:**\n\n• Maintain a daily routine to provide structure and comfort.\n• Use labels, calendars, and reminder apps (like MedReminder!) to stay organized.\n• Engage in brain-stimulating activities: puzzles, reading, memory games.\n• Stay socially active — regular conversations help cognitive function.\n• Exercise regularly — it improves blood flow to the brain.\n• Eat a brain-healthy diet: fish, nuts, berries, leafy greens.\n\n💙 **Remember:** you are not alone. Reach out to caregivers, support groups, and healthcare professionals for help.`
  },
  {
    keywords: ['dehydration', 'water', 'thirst', 'dry mouth', 'not drinking enough'],
    response: `💧 **Staying Hydrated:**\n\n• Drink at least 8 glasses (2 liters) of water daily.\n• Increase intake in hot weather or after exercise.\n• Eat water-rich foods: watermelon, cucumber, oranges, soups.\n• Set reminders to drink water throughout the day.\n• Limit caffeine and alcohol — they can dehydrate you.\n• Signs of dehydration: dark urine, dry mouth, dizziness, fatigue.\n\n⚠️ **Seek help if:** you can't keep fluids down, feel very dizzy, or have very dark urine.`
  },
  {
    keywords: ['breathing', 'breath', 'asthma', 'shortness of breath', 'wheezing', 'breathless'],
    response: `🫁 **Breathing & Respiratory Tips:**\n\n• Sit upright to help expand your lungs.\n• Practice pursed-lip breathing: inhale through nose, exhale slowly through pursed lips.\n• Avoid smoke, dust, and strong perfumes.\n• If you have asthma, always keep your inhaler nearby.\n• Use a humidifier if indoor air is very dry.\n• Stay away from known triggers.\n\n🚨 **Seek emergency help if:** you have sudden severe breathlessness, blue lips, or can't complete sentences due to breathlessness.`
  },
  {
    keywords: ['eye', 'vision', 'blurry', 'eye pain', 'red eye', 'eye strain'],
    response: `👁️ **Eye Health Tips:**\n\n• Follow the 20-20-20 rule: every 20 min, look at something 20 feet away for 20 seconds.\n• Keep screens at arm's length and slightly below eye level.\n• Blink often to keep eyes moist, especially at screens.\n• Wear sunglasses to protect from UV rays outdoors.\n• Eat eye-healthy foods: carrots, leafy greens, fish.\n• Ensure good lighting when reading or working.\n\n⚠️ **See a doctor if:** you have sudden vision changes, eye pain, flashes of light, or persistent redness.`
  },
  {
    keywords: ['depression', 'sad', 'hopeless', 'lonely', 'depressed', 'unmotivated', 'mood'],
    response: `💙 **Mental Health & Depression Support:**\n\n• Talk to someone you trust — a friend, family member, or counselor.\n• Maintain a daily routine, even small routines help.\n• Get outside and get some sunlight every day.\n• Exercise — even a short walk can improve your mood.\n• Limit alcohol and avoid isolation.\n• Practice gratitude — write down 3 things you're grateful for each day.\n\n⚠️ **If you're in crisis:** Please reach out to a mental health professional or call a helpline. You are not alone, and help is available. 💛`
  },
  {
    keywords: ['dental', 'tooth', 'toothache', 'gum', 'teeth'],
    response: `🦷 **Dental Health Tips:**\n\n• Brush teeth twice daily for at least 2 minutes.\n• Floss daily to remove plaque between teeth.\n• Rinse with warm salt water for gum pain or minor toothache.\n• Avoid very hot, cold, or sugary foods if teeth are sensitive.\n• Visit a dentist every 6 months for check-ups.\n\n⚠️ **See a dentist if:** you have severe tooth pain, swelling, or bleeding gums that don't stop.`
  },
  {
    keywords: ['constipation', 'bloating', 'gas', 'bowel', 'hard stool'],
    response: `🍎 **Constipation & Bloating Relief:**\n\n• Eat high-fiber foods: fruits, vegetables, whole grains, beans.\n• Drink plenty of water — at least 8 glasses a day.\n• Exercise regularly — walking helps stimulate bowel movements.\n• Don't ignore the urge to go to the bathroom.\n• Try warm water with lemon in the morning.\n• Reduce processed foods and excessive dairy.\n\n⚠️ **See a doctor if:** constipation lasts more than 2 weeks, or comes with blood in stool or severe pain.`
  },
];

// ── Greeting patterns ────────────────
const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'sup', 'hola'];
const thanks = ['thank', 'thanks', 'thankyou', 'thank you', 'appreciate', 'helpful'];
const byes = ['bye', 'goodbye', 'see you', 'take care', 'later'];

/**
 * Find the best matching response from the knowledge base.
 */
function findResponse(userMessage) {
  const msg = userMessage.toLowerCase().trim();

  // Check greetings
  if (greetings.some(g => msg.includes(g))) {
    return "👋 Hello! I'm **MedBot**, your health wellness assistant. You can ask me about symptoms, lifestyle tips, medications, or when to see a doctor. What would you like to know?";
  }

  // Check thanks
  if (thanks.some(t => msg.includes(t))) {
    return "😊 You're welcome! I'm happy to help. Feel free to ask me anything else about your health. Take care! 💙";
  }

  // Check goodbyes
  if (byes.some(b => msg.includes(b))) {
    return "👋 Goodbye! Take care of yourself. Remember to take your medicines on time and stay healthy! See you soon. 💊💙";
  }

  // Score each knowledge base entry
  let bestMatch = null;
  let bestScore = 0;

  for (const entry of medicalKB) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (msg.includes(keyword)) {
        // Longer keyword matches are more specific, so weight them higher
        score += keyword.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore > 0) {
    return bestMatch.response;
  }

  // Fallback — no match
  return `🤔 I'm not sure about that specific topic, but here are some general tips:\n\n• **Stay hydrated** — drink plenty of water daily.\n• **Eat balanced meals** with fruits, vegetables, and whole grains.\n• **Exercise regularly** — even a 20-minute walk helps.\n• **Get enough sleep** — aim for 7–9 hours.\n• **Take your medicines on time** using MedReminder!\n\n💡 Try asking me about specific symptoms like **headache**, **fever**, **stomach pain**, **anxiety**, **sleep issues**, **diabetes**, **blood pressure**, or **allergies**.\n\n⚠️ For serious or persistent symptoms, always consult a healthcare professional.`;
}


/* ── MedBot Component ────────────────────────────────── */
export default function MedBot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "👋 Hi! I'm **MedBot**, your health wellness assistant. Ask me about symptoms, lifestyle tips, or when to see a doctor. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Don't render if user is not logged in
  if (!user) return null;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setIsTyping(true);

    // Simulate a short "thinking" delay for natural feel
    setTimeout(() => {
      const reply = findResponse(trimmed);
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Simple markdown bold rendering
  const renderText = (text) => {
    // Split into lines first, then handle bold within each line
    return text.split('\n').map((line, lineIdx) => (
      <span key={lineIdx}>
        {lineIdx > 0 && <br />}
        {line.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </span>
    ));
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        id="medbot-toggle"
        className={`medbot-fab ${isOpen ? 'medbot-fab-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with MedBot"
      >
        {isOpen ? (
          <span className="medbot-fab-icon">✕</span>
        ) : (
          <>
            <span className="medbot-fab-icon">🤖</span>
            <span className="medbot-fab-label">MedBot</span>
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="medbot-window" id="medbot-chat-window">
          {/* Header */}
          <div className="medbot-header">
            <div className="medbot-header-left">
              <div className="medbot-avatar">🤖</div>
              <div>
                <div className="medbot-title">MedBot</div>
                <div className="medbot-subtitle">AI Health Assistant</div>
              </div>
            </div>
            <button
              className="medbot-close"
              onClick={() => setIsOpen(false)}
              title="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="medbot-messages" id="medbot-messages-area">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`medbot-msg ${msg.role === 'user' ? 'medbot-msg-user' : 'medbot-msg-bot'}`}
              >
                {msg.role === 'bot' && <span className="medbot-msg-avatar">🤖</span>}
                <div className={`medbot-msg-bubble ${msg.role === 'user' ? 'medbot-bubble-user' : 'medbot-bubble-bot'}`}>
                  {renderText(msg.text)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="medbot-msg medbot-msg-bot">
                <span className="medbot-msg-avatar">🤖</span>
                <div className="medbot-bubble-bot medbot-typing">
                  <span className="medbot-dot"></span>
                  <span className="medbot-dot"></span>
                  <span className="medbot-dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="medbot-input-area">
            <input
              ref={inputRef}
              id="medbot-input"
              type="text"
              className="medbot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about symptoms, tips..."
              disabled={isTyping}
              autoComplete="off"
            />
            <button
              id="medbot-send"
              className="medbot-send"
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              title="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
